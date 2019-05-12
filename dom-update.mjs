/* global window */

export default (target, requestAnimationFrame = window.requestAnimationFrame) => {
  const document = target.ownerDocument

  const fromHTML = (html) => {
    const div = document.createElement('div')

    div.innerHTML = html

    return div.childNodes
  }

  const morphAttributes = (target, nextAttributes, namespaces) => {
    const nextKeys = Object.keys(nextAttributes)

    let nextAttributeIndex = -1

    while (++nextAttributeIndex < nextKeys.length) {
      const key = nextKeys[nextAttributeIndex]

      let attributeNS

      const colonIndex = key.indexOf(':')

      if (colonIndex > -1) {
        const prefix = key.substring(0, colonIndex)

        const nsKey = `xmlns:${prefix}`

        if (namespaces[nsKey]) {
          attributeNS = namespaces[nsKey]
        }
      }

      const val = nextAttributes[key]

      const isBoolean = typeof val === 'boolean'

      const isEvent = key.startsWith('on')

      if (isBoolean || isEvent || key === 'value') {
        target[key] = val
      }

      if (!isEvent) {
        if (val == null || val === false) {
          target.removeAttribute(key)
        } else if (attributeNS != null) {
          target.setAttributeNS(attributeNS, key, isBoolean ? '' : val)
        } else {
          target.setAttribute(key, isBoolean ? '' : val)
        }
      }
    }
  }

  const morphChildren = (target, nextChildren, namespaces) => {
    let nextChildIndex = -1

    let htmlCount = 0

    while (++nextChildIndex < nextChildren.length) {
      htmlCount--

      let nextChild = nextChildren[nextChildIndex]

      if (nextChild.html != null) {
        const html = fromHTML(nextChild.html)

        nextChildren.splice(nextChildIndex, 1, ...html)

        htmlCount = html.length

        nextChild = nextChildren[nextChildIndex]
      }

      const childNode = target.childNodes[nextChildIndex]

      const isHTML = htmlCount > 0

      if (isHTML && childNode && childNode.isEqualNode(nextChild)) {
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
          const namespace = nextChild.attributes.xmlns || namespaces.xmlns

          if (namespace != null) {
            el = document.createElementNS(namespace, nextChild.tag)
          } else {
            el = document.createElement(nextChild.tag)
          }

          morph(el, nextChild, namespaces)
        }

        if (append) {
          target.appendChild(el)
        } else {
          target.replaceChild(el, childNode)
        }
      } else if (isText) {
        childNode.nodeValue = nextChild
      } else {
        morph(childNode, nextChild, namespaces)
      }
    }
  }

  const truncateChildren = (target, length) => {
    while (target.childNodes.length > length) {
      target.removeChild(target.childNodes[length])
    }
  }

  const morph = (target, next, namespaces = {}) => {
    for (const key of Object.keys(next.attributes)) {
      if (key === 'xmlns' || key.startsWith('xmlns:')) {
        namespaces[key] = next.attributes[key]
      }
    }

    morphAttributes(target, next.attributes, namespaces)

    const children = next.children.flat().filter((child) => child != null)

    morphChildren(target, children, namespaces)

    truncateChildren(target, children.length)
  }

  return (current) => {
    requestAnimationFrame(() => {
      morph(target, current)
    })
  }
}
