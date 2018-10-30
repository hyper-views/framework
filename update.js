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

    if (typeof next.children[i] !== 'object') {
      el = document.createTextNode(next.children[i])

      if (target.childNodes[i] == null) {
        target.appendChild(el)
      } else if (next.children[i] !== previous.children[i]) {
        target.replaceChild(el, target.childNodes[i])
      }
    } else if (target.childNodes[i] == null) {
      el = document.createElement(next.children[i].tag)

      el = morph(el, next.children[i], previous.children[i])

      target.appendChild(el)

      if (next.children[i].attributes.onmount) {
        next.children[i].attributes.onmount.call(el)
      }
    } else if (target.childNodes[i].nodeType !== 1 || previous.children[i] == null || (next.children[i].tag !== previous.children[i].tag && previous.children[i].tag != null)) {
      el = document.createElement(next.children[i].tag)

      el = morph(el, next.children[i], previous.children[i])

      target.replaceChild(el, target.childNodes[i])

      if (next.children[i].attributes.onmount) {
        next.children[i].attributes.onmount.call(el)
      }
    } else {
      el = target.childNodes[i]

      morph(el, next.children[i], previous.children[i])
    }
  }

  while (target.childNodes.length > i) {
    target.removeChild(target.childNodes[i])
  }

  return target
}
