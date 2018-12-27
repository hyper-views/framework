/* global window */

export default ({ store, component, update, raf }) => {
  raf = raf != null ? raf : window.requestAnimationFrame

  let rafCalled = false

  let state

  const render = () => {
    rafCalled = false

    update(component({ state, dispatch }))
  }

  const commit = (produce) => {
    state = produce(state)

    if (!rafCalled) {
      rafCalled = true

      raf(render)
    }
  }

  const dispatch = store(commit)

  return dispatch
}

const defaultDom = {
  tag: null,
  attributes: {},
  children: []
}

const morph = (target, next, previous) => {
  const targetNamespace = target.namespaceURI
  const document = target.ownerDocument

  if (!previous) {
    previous = defaultDom
  }

  const usedAttributes = []

  const nextAttrs = Object.keys(next.attributes)

  for (let i = 0; i < nextAttrs.length; i++) {
    const key = nextAttrs[i]

    usedAttributes.push(key)

    const val = next.attributes[key]

    if (['selected', 'checked', 'disabled'].includes(key)) {
      target[key] = val

      if (val) {
        target.setAttribute(key, '')
      } else {
        target.removeAttribute(key)
      }
    } else if (key === 'value') {
      target.value = val

      target.setAttribute('value', val)
    } else if (val !== previous.attributes[key]) {
      if (key.startsWith('on')) {
        if (!['onmount', 'onupdate'].includes(key)) target[key] = val
      } else {
        target.setAttribute(key, val)
      }
    }
  }

  const unusedAttrs = Object.keys(previous.attributes).filter((key) => !usedAttributes.includes(key))

  for (let i = 0; i < unusedAttrs.length; i++) {
    const key = unusedAttrs[i]

    if (key.startsWith('on')) {
      if (!['onmount', 'onupdate'].includes(key)) delete target[key]
    } else {
      if (key === 'value') {
        target.value = ''
      } else if (['selected', 'checked', 'disabled'].includes(key)) {
        target[key] = false
      }

      target.removeAttribute(key)
    }
  }

  for (let i = 0; i < next.children.length; i++) {
    const nextChild = next.children[i]
    const previousChild = previous.children[i]
    const childNode = target.childNodes[i]
    const shouldAppendChild = childNode == null

    if (typeof nextChild !== 'object') {
      const el = document.createTextNode(nextChild)

      if (shouldAppendChild) {
        target.appendChild(el)
      } else if (nextChild !== previousChild) {
        target.replaceChild(el, childNode)
      }

      continue
    }

    const nextNamespace = typeof nextChild === 'object' && nextChild.attributes.xmlns != null ? nextChild.attributes.xmlns : targetNamespace

    const shouldReplaceChild = !shouldAppendChild && (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== nextChild.tag)
    let el

    if (shouldAppendChild || shouldReplaceChild) {
      el = document.createElementNS(nextNamespace, nextChild.tag)

      el = morph(el, nextChild)

      if (shouldAppendChild) {
        target.appendChild(el)
      } else if (shouldReplaceChild) {
        target.replaceChild(el, childNode)
      }

      if (nextChild.attributes.onmount) {
        nextChild.attributes.onmount.call(el)
      }
    } else {
      el = childNode

      morph(el, nextChild, previousChild)
    }

    if (nextChild.attributes.onupdate) {
      nextChild.attributes.onupdate.call(el)
    }
  }

  while (target.childNodes.length > next.children.length) {
    target.removeChild(target.childNodes[next.children.length])
  }

  return target
}

export const update = (target) => {
  let previous

  return (next) => {
    const result = morph(target, next, previous)

    if (typeof next === 'object' && next.attributes.onupdate) {
      next.attributes.onupdate.call(target)
    }

    previous = next

    return result
  }
}

const baseNode = {}

const create = (tag) => (...args) => {
  const attributes = {}
  let children
  let i = 0

  if (args[0] === false) {
    return null
  }

  if (args[0] === true) {
    i = 1
  }

  if (typeof args[i] === 'function') {
    args = [].concat(args[i]()).concat(args.slice(i + 1))

    i = 0
  }

  if (typeof args[i] === 'object' && !baseNode.isPrototypeOf(args[i])) {
    const keys = Object.keys(args[i])

    for (let j = 0; j < keys.length; j++) {
      const key = keys[j]

      attributes[key] = args[i][key]
    }

    children = args.slice(i + 1)
  } else {
    children = args.slice(i)
  }

  const result = Object.create(baseNode)

  result.tag = tag

  result.attributes = attributes

  result.children = children.filter((child) => child != null)

  return result
}

export const html = new Proxy({}, {
  get (_, tag) {
    return create(tag)
  }
})
