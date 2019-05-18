/* global window */

export default (target) => {
  const document = target.ownerDocument

  const fromHTML = (raw) => {
    const div = document.createElement('div')

    div.innerHTML = raw

    return div.childNodes
  }

  const morphAttributes = (target, nextAttributes, namespaces) => {
    for (const key in nextAttributes) {
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

  const morphChildren = (target, nextChildren, variables, namespaces) => {
    let htmlCount = 0

    let nextChildrenLength = 0

    for (let nextChildIndex = 0; nextChildIndex < nextChildren.length; nextChildIndex++) {
      htmlCount--

      let subChildren = nextChildren[nextChildIndex]

      if (subChildren == null) continue

      if (typeof subChildren === 'function') {
        subChildren = subChildren(variables)
      }

      if (!Array.isArray(subChildren)) {
        subChildren = [subChildren]
      }

      let subIndex = -1

      while (++subIndex < subChildren.length) {
        let nextChild = subChildren[subIndex]

        if (nextChild == null) continue

        const isText = typeof nextChild !== 'object'

        if (nextChild.raw != null) {
          const html = fromHTML(nextChild.raw)

          subChildren.splice(subIndex, 1, ...html)

          htmlCount = html.length

          nextChild = subChildren[subIndex]
        } else if (!isText && nextChild.tree == null) {
          nextChild = {
            tree: nextChild,
            variables
          }
        }

        const childNode = target.childNodes[nextChildrenLength]

        nextChildrenLength++

        const isHTML = htmlCount > 0

        if (isHTML && childNode && childNode.isEqualNode(nextChild)) {
          continue
        }

        let append = false

        let replace = false

        if (childNode == null) {
          append = true
        } else if (isHTML || (isText && childNode.nodeType !== 3) || (!isText && (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== nextChild.tree.tag))) {
          replace = true
        }

        if (append || replace) {
          let el

          if (isText) {
            el = document.createTextNode(nextChild)
          } else if (isHTML) {
            el = nextChild
          } else {
            const namespace = nextChild.tree.attributes.xmlns || namespaces.xmlns

            if (namespace != null) {
              el = document.createElementNS(namespace, nextChild.tree.tag)
            } else {
              el = document.createElement(nextChild.tree.tag)
            }

            morph(el, nextChild, namespaces)
          }

          if (append) {
            target.appendChild(el)
          } else {
            target.replaceChild(el, childNode)
          }
        } else if (isText) {
          if (childNode.nodeValue !== nextChild) {
            childNode.nodeValue = nextChild
          }
        } else {
          morph(childNode, nextChild, namespaces)
        }
      }
    }

    return nextChildrenLength
  }

  const truncateChildren = (target, length) => {
    while (target.childNodes.length > length) {
      target.removeChild(target.childNodes[length])
    }
  }

  const morph = (target, next, namespaces = {}) => {
    const attributes = {}

    const {tree, variables} = next

    for (const key in tree.attributes) {
      let value = tree.attributes[key]

      if (typeof value === 'function') {
        value = value(variables)
      }

      if (key === 'xmlns' || key.startsWith('xmlns:')) {
        namespaces[key] = value
      }

      if (key === '_') {
        for (const k in value) {
          attributes[k] = value[k]
        }

        continue
      }

      attributes[key] = value
    }

    morphAttributes(target, attributes, namespaces)

    const nextChildrenLength = morphChildren(target, next.tree.children, variables, namespaces)

    truncateChildren(target, nextChildrenLength)
  }

  return (current) => {
    setTimeout(() => {
      morph(target, current)
    }, 0)
  }
}
