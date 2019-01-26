/* global window */

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
    } else {
      el = childNode

      morph(el, nextChild, previousChild)
    }
  }

  while (target.childNodes.length > next.children.length) {
    target.removeChild(target.childNodes[next.children.length])
  }

  setTimeout(() => {
    if (typeof next === 'object' && next.attributes.onupdate) {
      next.attributes.onupdate.call(target)
    }

    if (previous === defaultDom) {
      if (next.attributes.onmount) {
        next.attributes.onmount.call(target)
      }
    }
  }, 0)

  return target
}

export default (target, raf = window.requestAnimationFrame) => {
  let previous
  let called = false
  let next

  return (current) => {
    next = current

    if (!called) {
      called = true

      raf(() => {
        morph(target, next, previous)

        called = false

        previous = next
      })
    }
  }
}
