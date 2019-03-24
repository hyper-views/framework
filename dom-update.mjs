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

      const colonIndex = key.indexOf(':')
      let attrNS

      if (colonIndex > -1) {
        const prefix = key.substring(0, colonIndex)

        if (next.attributes[`xmlns:${prefix}`]) {
          attrNS = next.attributes[`xmlns:${prefix}`]
        }
      }

      const val = next.attributes[key]
      const isBoolean = typeof val === 'boolean'
      const isEvent = key.startsWith('on')

      if (isBoolean || isEvent || key === 'value') {
        target[key] = val
      }

      if (!isEvent && val !== previous.attributes[key] && (!isBoolean || val)) {
        if (attrNS != null) {
          target.setAttributeNS(attrNS, key, isBoolean ? '' : val)
        } else {
          target.setAttribute(key, isBoolean ? '' : val)
        }
      }

      if (!isBoolean || val) {
        usedAttributes.push(key)
      }
    }

    const prevAttrs = Object.keys(previous.attributes)

    i = -1

    while (++i < prevAttrs.length) {
      const key = prevAttrs[i]

      const colonIndex = key.indexOf(':')

      let attrNS

      if (colonIndex > -1) {
        const prefix = key.substring(0, colonIndex)

        if (next.attributes[`xmlns:${prefix}`]) {
          attrNS = next.attributes[`xmlns:${prefix}`]
        }
      }

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
        if (attrNS != null) {
          target.removeAttributeNS(attrNS, key.substring(colonIndex + 1))
        } else {
          target.removeAttribute(key)
        }
      }
    }

    i = -1

    let htmlCount = 0

    while (++i < next.children.length) {
      htmlCount--

      let nextChild = next.children[i]

      if (nextChild.html != null) {
        const html = fromHTML(nextChild.html)

        next.children.splice(i, 1, ...html)

        htmlCount = html.length

        nextChild = next.children[i]
      }

      const previousChild = previous.children[i]
      const childNode = target.childNodes[i]

      const isHTML = htmlCount > 0

      if (nextChild === previousChild || (isHTML && childNode && childNode.isEqualNode(nextChild))) {
        continue
      }

      const isText = typeof nextChild !== 'object'
      let append = false
      let replace = false

      if (childNode == null) {
        append = true
      } else if (isHTML || (isText && childNode.nodeType !== 3) || (!isText && (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== nextChild.tag))) {
        replace = true
      }

      if (append || replace) {
        let el

        if (isText) {
          el = document.createTextNode(nextChild)
        } else if (isHTML) {
          el = nextChild
        } else {
          if (nextChild.attributes.xmlns != null) {
            el = document.createElementNS(nextChild.attributes.xmlns, nextChild.tag)
          } else {
            el = document.createElement(nextChild.tag)
          }

          el = morph(el, nextChild)
        }

        if (append) {
          target.appendChild(el)
        } else {
          target.replaceChild(el, childNode)
        }
      } else if (isText) {
        childNode.nodeValue = nextChild
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
