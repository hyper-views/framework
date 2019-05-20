/* global window */

const svgNamespace = 'http://www.w3.org/2000/svg'

const xlinkNamespace = 'http://www.w3.org/1999/xlink'

const fromHTML = (raw, document) => {
  const div = document.createElement('div')

  div.innerHTML = raw

  return div.childNodes
}

const morphAttribute = (target, key, value) => {
  const isBoolean = typeof value === 'boolean'

  const isEvent = key.substring(0, 2) === 'on'

  if (isBoolean || isEvent || key === 'value') {
    target[key] = value
  }

  if (!isEvent) {
    if (value == null || value === false) {
      target.removeAttribute(key)
    } else {
      const namespace = key.substring(0, 6) === 'xlink:' ? xlinkNamespace : null

      target.setAttributeNS(namespace, key, isBoolean ? '' : value)
    }
  }
}

const morphAttributes = (target, attributes, variables) => {
  for (const key in attributes) {
    let value = attributes[key]

    if (typeof value === 'function') {
      value = value(variables)
    }

    morphAttribute(target, key, value)
  }
}

const morphUnderscoreAttributes = (target, _attributes, variables) => {
  for (let i = 0; i < _attributes.length; i++) {
    let attributes = _attributes[i]

    if (typeof attributes === 'function') {
      attributes = attributes(variables)
    }

    for (const key in attributes) {
      morphAttribute(target, key, attributes[key])
    }
  }
}

const morphChildren = (target, children, variables) => {
  const document = target.ownerDocument

  let childrenLength = 0

  for (let childIndex = 0; childIndex < children.length; childIndex++) {
    let subChildren = children[childIndex]

    if (subChildren == null) continue

    if (typeof subChildren === 'function') {
      subChildren = subChildren(variables)
    }

    if (!Array.isArray(subChildren)) {
      subChildren = [subChildren]
    }

    let subIndex = -1
    let htmlCount = 0

    while (++subIndex < subChildren.length) {
      htmlCount--

      let child = subChildren[subIndex]

      if (child == null) continue

      const isText = typeof child !== 'object'
      let isHTML = htmlCount > 0

      if (child.raw != null) {
        const html = fromHTML(child.raw, document)

        subChildren.splice(subIndex, 1, ...html)

        htmlCount = html.length

        child = subChildren[subIndex]

        isHTML = true
      } else if (!isHTML && !isText && child.tree == null) {
        child = {
          tree: child,
          variables
        }
      }

      const childNode = target.childNodes[childrenLength]

      childrenLength++

      let append = false

      let replace = false

      if (childNode == null) {
        append = true
      } else if ((isHTML && !childNode.isEqualNode(child)) || (isText && childNode.nodeType !== 3) || (!isText && (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== child.tree.tag))) {
        replace = true
      }

      if (append || replace) {
        let el

        if (isText) {
          el = document.createTextNode(child)
        } else if (isHTML) {
          el = child
        } else {
          const namespace = child.tree.tag === 'svg' ? svgNamespace : target.namespaceURI

          el = document.createElementNS(namespace, child.tree.tag)

          morph(el, child)
        }

        if (append) {
          target.appendChild(el)
        } else {
          target.replaceChild(el, childNode)
        }
      } else if (isText) {
        if (childNode.data !== child) {
          childNode.data = child
        }
      } else {
        morph(childNode, child)
      }
    }
  }

  return childrenLength
}

const truncateChildren = (target, length) => {
  while (target.childNodes.length > length) {
    target.removeChild(target.childNodes[length])
  }
}

const morph = (target, next) => {
  const {tree, variables} = next

  morphAttributes(target, tree.attributes, variables)

  morphUnderscoreAttributes(target, tree._attributes, variables)

  const childrenLength = morphChildren(target, tree.children, variables)

  truncateChildren(target, childrenLength)
}

export default (target) => {
  return (current) => {
    setTimeout(() => {
      morph(target, current)
    }, 0)
  }
}
