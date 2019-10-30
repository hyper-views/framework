const svgNamespace = 'http://www.w3.org/2000/svg'

const xlinkNamespace = 'http://www.w3.org/1999/xlink'

const viewMap = new WeakMap()
const eventMap = new WeakMap()

const attrToProp = {
  class: 'className',
  for: 'htmlFor'
}

const morphAttribute = (target, key, value) => {
  const remove = value == null || value === false

  if (key.substring(0, 2) === 'on') {
    const listeners = eventMap.get(target) || {}

    key = key.substring(2)

    if (remove) {
      if (listeners[key]) {
        target.removeEventListener(key, listeners[key].proxy)

        listeners[key] = null
      }
    } else if (listeners[key]) {
      listeners[key].handler = value
    } else {
      listeners[key] = {
        proxy(...args) {
          const event = (eventMap.get(target) || {})[key]

          if (event) {
            event.handler.apply(this, args)
          }
        },
        handler: value
      }

      target.addEventListener(key, listeners[key].proxy)
    }

    eventMap.set(target, listeners)
  } else {
    if (remove) {
      target.removeAttribute(key)
    }

    const namespace = key.substring(0, 6) === 'xlink:' ? xlinkNamespace : null

    if (!namespace && target.namespaceURI !== svgNamespace && key.substr(0, 5) !== 'data-') {
      if (attrToProp[key]) {
        key = attrToProp[key]
      }

      if (target[key] !== value) {
        target[key] = value
      }
    } else if (!remove) {
      const stringified = value === true ? '' : value

      if (target.getAttributeNS(namespace, key) !== stringified) {
        target.setAttributeNS(namespace, key, stringified)
      }
    }
  }
}

const morphChild = (target, index, next, variables, same) => {
  const document = target.ownerDocument

  if (next == null) {
    return 0
  }

  if (next.type === 'html') {
    const div = document.createElement('div')

    div.innerHTML = next.html

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

  if (next.type === 'text') {
    if (!append && childNode.nodeType !== 3) {
      replace = true
    }

    if (append || replace) {
      newChild = next.text
    } else if (childNode.data !== next.text) {
      childNode.data = next.text
    }
  } else {
    const tag = next.tag || next.tree.tag

    if (!append && (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== tag)) {
      replace = true
    }

    if (append || replace) {
      const namespace = tag === 'svg' ? svgNamespace : target.namespaceURI

      newChild = namespace !== 'http://www.w3.org/1999/xhtml' ? document.createElementNS(namespace, tag) : document.createElement(tag)
    }

    const t = newChild || childNode

    if (next.view != null) {
      morphRoot(t, next)
    } else {
      morph(t, next, variables, same)
    }
  }

  if (append) {
    target.append(newChild)
  } else if (replace) {
    childNode.replaceWith(newChild)
  }

  return 1
}

const morph = (target, next, variables, same) => {
  if (same && !next.dynamic) {
    return
  }

  if (next.attributes.length) {
    for (let i = 0, length = next.attributes.length; i < length; i++) {
      const attribute = next.attributes[i]

      if (same && !attribute.variable) {
        continue
      }

      let value = attribute.value

      if (attribute.variable) {
        value = variables[value]
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

  let childrenLength = 0

  if (next.children.length) {
    let result = 0
    const length = next.children.length
    let deopt = !same

    for (let childIndex = 0; childIndex < length; childIndex++) {
      let child = next.children[childIndex]

      if (child == null) {
        continue
      }

      if (!deopt && !child.dynamic && !child.variable) {
        result += 1

        continue
      }

      deopt = true

      if (child.variable) {
        child = variables[child.value]

        if (child != null && child.view == null && child.type == null && !Array.isArray(child)) {
          child = {type: 'text', text: child}
        }
      }

      if (Array.isArray(child)) {
        for (let grandIndex = 0, length = child.length; grandIndex < length; grandIndex++) {
          const grand = child[grandIndex]

          result += morphChild(target, result, grand, variables, same)
        }
      } else {
        result += morphChild(target, result, child, variables, same)
      }
    }

    childrenLength = result
  }

  while (target.childNodes.length > childrenLength) {
    target.childNodes[length].remove()
  }
}

const morphRoot = (target, next) => {
  const dataView = viewMap.get(target)
  const same = next.view === dataView

  if (!same) {
    viewMap.set(target, next.view)
  }

  morph(target, next.tree, next.variables, same)
}

export const domUpdate = (target) => (current, cb = () => {}) => {
  setTimeout(() => {
    morphRoot(target, current)

    cb()
  }, 0)
}
