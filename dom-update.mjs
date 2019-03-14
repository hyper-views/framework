/* global window */

const defaultDom = {
  tag: null,
  attributes: {},
  children: []
}

export default (target, w = window) => {
  const document = target.ownerDocument

  const fromHTML = (html) => {
    const div = document.createElement('div')

    div.innerHTML = html

    return div.childNodes
  }

  const morph = (target, next, previous) => {
    if (!previous) {
      previous = defaultDom
    }

    const usedAttributes = []

    const nextAttrs = Object.keys(next.attributes)

    let i

    i = -1

    while (++i < nextAttrs.length) {
      const key = nextAttrs[i]

      const val = next.attributes[key]
      const isBoolean = typeof val === 'boolean'
      const isEvent = key.startsWith('on')

      if (isBoolean || isEvent || key === 'value') {
        target[key] = val
      }

      if (!isEvent && val !== previous.attributes[key] && (!isBoolean || val)) {
        target.setAttribute(key, isBoolean ? '' : val)
      }

      if (!isBoolean || val) {
        usedAttributes.push(key)
      }
    }

    const prevAttrs = Object.keys(previous.attributes)

    i = -1

    while (++i < prevAttrs.length) {
      const key = prevAttrs[i]

      if (usedAttributes.includes(key)) {
        continue
      }

      const isEvent = key.startsWith('on')

      if (isEvent) {
        target[key] = null
      } else if (key === 'value') {
        target.value = ''
      } else if (typeof previous.attributes[key] === 'boolean') {
        target[key] = false
      }

      if (!isEvent) {
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

      const isText = typeof nextChild !== 'object'
      const isHTML = !isText && (nextChild instanceof w.Element || nextChild instanceof w.Text)

      let append = false
      let replace = false

      if (childNode == null) {
        append = true
      } else if (isText && nextChild === previousChild) {
        continue
      } else if (isHTML && childNode.isEqualNode(nextChild)) {
        continue
      }

      if (isText || isHTML) {
        replace = !append
      } else if (childNode != null && (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== nextChild.tag)) {
        replace = true
      }

      if (append || replace) {
        let el

        if (isText) {
          el = document.createTextNode(nextChild)
        } else if (isHTML) {
          el = nextChild
        } else {
          el = document.createElementNS(nextChild.attributes.xmlns != null ? nextChild.attributes.xmlns : target.namespaceURI, nextChild.tag)

          el = morph(el, nextChild)
        }

        if (append) {
          target.appendChild(el)
        } else {
          target.replaceChild(el, childNode)
        }
      } else {
        morph(childNode, nextChild, previousChild)
      }
    }

    while (target.childNodes.length > next.children.length) {
      target.removeChild(target.childNodes[next.children.length])
    }

    return target
  }

  let previous

  return (current) => {
    setTimeout(() => {
      morph(target, current, previous)

      previous = current
    }, 0)
  }
}
