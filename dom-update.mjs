/* global window */

const defaultDom = {
  tag: null,
  attributes: {},
  children: []
}

export default (target, w = window) => {
  const raf = w.requestAnimationFrame
  const document = target.ownerDocument

  const fromHTML = (html) => {
    const div = document.createElement('div')

    div.innerHTML = html

    return div.childNodes
  }

  const morph = (target, next, previous) => {
    const targetNamespace = target.namespaceURI

    if (!previous) {
      previous = defaultDom
    }

    const usedAttributes = []

    const nextAttrs = Object.keys(next.attributes)

    let i

    i = -1

    while (++i < nextAttrs.length) {
      const key = nextAttrs[i]

      usedAttributes.push(key)

      const val = next.attributes[key]

      if (typeof val === 'boolean') {
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

    const prevAttrs = Object.keys(previous.attributes)

    i = -1

    while (++i < prevAttrs.length) {
      const key = prevAttrs[i]

      if (usedAttributes.includes(key)) {
        continue
      }

      if (key.startsWith('on')) {
        target[key] = null
      } else {
        if (key === 'value') {
          target.value = ''
        } else if (typeof previous.attributes[key] === 'boolean') {
          target[key] = false
        }

        target.removeAttribute(key)
      }
    }

    i = -1

    while (++i < next.children.length) {
      if (next.children[i].html != null) {
        next.children.splice(i, 1, ...fromHTML(next.children[i].html))
      }

      const nextChild = next.children[i]
      const previousChild = previous.children[i]
      const childNode = target.childNodes[i]
      const shouldAppendChild = childNode == null
      const isText = typeof nextChild !== 'object'
      const isHTML = !isText && (nextChild instanceof w.Element || nextChild instanceof w.Text)

      if (isText || isHTML) {
        const el = isText ? document.createTextNode(nextChild) : nextChild

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

    return target
  }

  let called = false
  let previous

  return (next) => {
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
