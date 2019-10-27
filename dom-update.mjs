const svgNamespace = 'http://www.w3.org/2000/svg'

const xlinkNamespace = 'http://www.w3.org/1999/xlink'

const viewMap = new WeakMap()
const eventMap = new WeakMap()

const morphAttribute = (target, key, value) => {
  const remove = value == null || value === false

  if (key.substring(0, 2) === 'on') {
    const listeners = eventMap.get(target) || {}

    key = key.substring(2)

    if (remove) {
      if (listeners[key]) {
        target.removeEventListener(key, listeners[key].proxy)
      }
    } else if (listeners[key]) {
      listeners[key].handler = value
    } else {
      listeners[key] = {
        proxy() {
          return eventMap.get(target)[key].handler.call(this, ...arguments)
        },
        handler: value
      }

      target.addEventListener(key, listeners[key].proxy)

      eventMap.set(target, listeners)
    }
  } else {
    if (remove) {
      target.removeAttribute(key)
    }

    const namespace = key.substring(0, 6) === 'xlink:' ? xlinkNamespace : null

    if (!namespace && target.namespaceURI !== svgNamespace) {
      if (key === 'class') key = 'className'

      if (key === 'for') key = 'htmlFor'

      if (target[key] !== value) {
        target[key] = value
      }
    } else if(!remove) {
      const stringified = value === true || value === false ? '' : value

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

  if (child.type === 'html') {
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

  if (child.type === 'text') {
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

      newChild = namespace !== 'http://www.w3.org/1999/xhtml' ? document.createElementNS(namespace, tag) : document.createElement(tag)
    }

    const t = newChild || childNode

    if (child.view != null) {
      morphRoot(t, child)
    } else {
      morph(t, child, meta)
    }
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
  let deopt = !meta.same

  for (let childIndex = 0; childIndex < length; childIndex++) {
    let child = children[childIndex]

    if (child == null) continue

    if (!deopt && !child.dynamic && !child.variable) {
      result += 1

      continue
    }

    deopt = true

    if (child.variable) {
      child = meta.variables[child.value]

      if (child != null && child.view == null && child.type == null && !Array.isArray(child)) {
        child = {type: 'text', text: child}
      }
    }

    if (Array.isArray(child)) {
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

const morphRoot = (target, next) => {
  const dataView = viewMap.get(target)
  const same = next.view === dataView
  const meta = {
    variables: next.variables,
    view: next.view,
    same
  }

  if (!same) {
    viewMap.set(target, next.view)
  }

  morph(target, next.tree, meta)
}

export const domUpdate = (target) => (current, cb = () => {}) => {
  setTimeout(() => {
    morphRoot(target, current)

    cb()
  }, 0)
}
