const svgNamespace = 'http://www.w3.org/2000/svg'

const xlinkNamespace = 'http://www.w3.org/1999/xlink'

const morphAttribute = (target, key, value) => {
  const isBoolean = value === true || value === false

  const isEvent = key.substring(0, 2) === 'on'

  if (isBoolean || isEvent || key === 'value') {
    if (target[key] !== value) {
      target[key] = value
    }
  }

  if (!isEvent) {
    if (value == null || value === false) {
      target.removeAttribute(key)
    } else {
      const namespace = key.substring(0, 6) === 'xlink:' ? xlinkNamespace : null
      const stringified = isBoolean ? '' : value

      if (target.getAttributeNS(namespace, key) !== stringified) {
        target.setAttributeNS(namespace, key, stringified)
      }
    }
  }
}

const morphAttributes = (target, attributes, meta) => {
  for (let i = 0, length = attributes.length; i < length; i++) {
    const attribute = attributes[i]

    if (meta.same && !attribute.variable) {
      continue
    }

    let value = attribute.value

    if (attribute.variable) {
      value = meta.variables[value]
    }

    if (attribute.key) {
      morphAttribute(target, attribute.key, value)
    } else {
      for (const key of Object.keys(value)) {
        morphAttribute(target, key, value[key])
      }
    }
  }
}

const morphChild = (target, index, child, meta) => {
  const document = target.ownerDocument

  if (child == null) return 0

  if (child.html) {
    const div = document.createElement('div')

    div.innerHTML = child.html

    const length = div.childNodes.length

    for (let offset = 0; offset < length; offset++) {
      const childNode = target.childNodes[index + offset]

      const node = div.childNodes[0]

      if (childNode == null) {
        target.append(node)
      } else if (!childNode.isEqualNode(node)) {
        childNode.replaceWith(node)
      } else {
        node.remove()
      }
    }

    return length
  }

  const childNode = target.childNodes[index]

  const append = childNode == null

  let replace = false

  let newChild

  if (child.text != null) {
    if (!append && childNode.nodeType !== 3) {
      replace = true
    }

    if (append || replace) {
      newChild = child.text
    } else if (childNode.data !== child.text) {
      childNode.data = child.text
    }
  } else {
    const tag = child.tag || child.tree.tag

    if (!append && (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== tag)) {
      replace = true
    }

    if (append || replace) {
      const namespace = tag === 'svg' ? svgNamespace : target.namespaceURI

      newChild = document.createElementNS(namespace, tag)
    }

    const next = child.tree || child

    let m = meta

    const t = newChild || childNode

    if (child.view != null) {
      const dataView = t.getAttribute('data-view')
      const same = child.view === dataView

      m = {
        variables: child.variables,
        view: child.view,
        same
      }

      if (!same) {
        t.setAttribute('data-view', child.view)
      }
    }

    morph(t, next, m)
  }

  if (append) {
    target.append(newChild)
  } else if (replace) {
    childNode.replaceWith(newChild)
  }

  return 1
}

const morphChildren = (target, children, meta) => {
  let result = 0
  const length = children.length
  let started = !meta.same

  for (let childIndex = 0; childIndex < length; childIndex++) {
    let child = children[childIndex]

    if (child == null) continue

    if (!started && (!child.dynamic && !child.variable)) {
      result += 1

      continue
    }

    if (child.variable) {
      child = meta.variables[child.value]

      if (child != null && child.tree == null && child.html == null && !Array.isArray(child)) {
        child = {text: child}
      }
    }

    if (Array.isArray(child)) {
      started = true

      for (let grandIndex = 0, length = child.length; grandIndex < length; grandIndex++) {
        const grand = child[grandIndex]

        result += morphChild(target, result, grand, meta)
      }
    } else {
      result += morphChild(target, result, child, meta)
    }
  }

  return result
}

const truncateChildren = (target, length) => {
  while (target.childNodes.length > length) {
    target.childNodes[length].remove()
  }
}

const morph = (target, next, meta) => {
  if (meta.same && !next.dynamic) {
    return
  }

  if (next.attributes.length) {
    morphAttributes(target, next.attributes, meta)
  }

  let childrenLength = 0

  if (next.children.length) {
    childrenLength = morphChildren(target, next.children, meta)
  }

  truncateChildren(target, childrenLength)
}

export const domUpdate = (target) => (current, cb = () => {}) => {
  let lastView

  setTimeout(() => {
    const same = current.view === lastView

    lastView = current.view

    morph(target, current.tree, {
      variables: current.variables,
      view: current.view,
      same
    })

    cb()
  }, 0)
}
