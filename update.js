
const assert = require('assert')

const defaultDom = {
  tag: null,
  attributes: {},
  children: []
}

module.exports = (target) => {
  let previous

  return (next) => {
    assert.strictEqual(target.nodeName.toLowerCase(), next.tag, 'unsupported node replacement')

    const result = morph(target, next, previous)

    if (typeof next === 'object' && next.hooks.onupdate) {
      next.hooks.onupdate(target)
    }

    previous = next

    return result
  }
}

function morph (target, next, previous) {
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
        target[key] = val
      } else {
        target.setAttribute(key, val)
      }
    }
  }

  const unusedAttrs = Object.keys(previous.attributes).filter((key) => !usedAttributes.includes(key))

  for (let i = 0; i < unusedAttrs.length; i++) {
    const key = unusedAttrs[i]

    if (key.startsWith('on')) {
      delete target[key]
    } else {
      if (key === 'value') {
        target.value = ''
      } else if (['selected', 'checked', 'disabled'].includes(key)) {
        target[key] = false
      }

      target.removeAttribute(key)
    }
  }

  let i = 0

  for (; i < next.children.length; i++) {
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

      if (nextChild.hooks.onmount) {
        nextChild.hooks.onmount(el)
      }
    } else {
      el = childNode

      morph(el, nextChild, previousChild)
    }

    if (nextChild.hooks.onupdate) {
      nextChild.hooks.onupdate(el)
    }
  }

  while (target.childNodes.length > i) {
    target.removeChild(target.childNodes[i])
  }

  return target
}
