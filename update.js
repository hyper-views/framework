const defaultDom = {
  tag: null,
  attributes: {},
  children: []
}

module.exports = (target) => {
  let previous

  return (next) => {
    let result = morph(target, next, previous)

    previous = next

    return result
  }
}

function morph (target, next, previous) {
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
        if (key !== 'onmount') {
          target[key] = val
        }
      } else {
        target.setAttribute(key, val)
      }
    }
  }

  const unusedAttrs = Object.keys(previous.attributes).filter((key) => !usedAttributes.includes(key))

  for (let i = 0; i < unusedAttrs.length; i++) {
    const key = unusedAttrs[i]

    if (key.startsWith('on')) {
      if (key !== 'onmount') {
        delete target[key]
      }
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
    let el
    const nextChild = next.children[i]
    const previousChild = previous.children[i]
    const childNode = target.childNodes[i]

    if (typeof nextChild !== 'object') {
      el = document.createTextNode(nextChild)

      if (childNode == null) {
        target.appendChild(el)
      } else if (nextChild !== previousChild) {
        target.replaceChild(el, childNode)
      }
    } else if (childNode == null) {
      el = document.createElement(nextChild.tag)

      el = morph(el, nextChild, previousChild)

      target.appendChild(el)

      if (nextChild.attributes.onmount) {
        nextChild.attributes.onmount.call(el)
      }
    } else if (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== nextChild.tag) {
      el = document.createElement(nextChild.tag)

      el = morph(el, nextChild, previousChild)

      target.replaceChild(el, childNode)

      if (nextChild.attributes.onmount) {
        nextChild.attributes.onmount.call(el)
      }
    } else {
      el = childNode

      morph(el, nextChild, previousChild)
    }
  }

  while (target.childNodes.length > i) {
    target.removeChild(target.childNodes[i])
  }

  return target
}
