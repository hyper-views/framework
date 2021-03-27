const svgNamespace = 'http://www.w3.org/2000/svg'

const weakMap = new WeakMap()

const resolve = (obj) => {
  if (typeof obj === 'function') {
    let afterUpdate

    obj = obj((cb) => {
      afterUpdate = async (el) => cb(el)
    })

    if (obj) obj.afterUpdate = afterUpdate
  }

  return obj
}

const readMeta = (target, meta = {}) => {
  if (!meta._read) {
    const read = weakMap.get(target)

    Object.assign(meta, read ?? {})

    meta._read = true
  }

  return meta
}

const getNextSibling = (current) => current?.nextSibling

const addListener = (document, type) => {
  document.addEventListener(
    type,
    (e) => {
      const map = weakMap.get(e.target)

      if (map && map[type]) {
        map[type](e)
      }
    },
    {capture: true}
  )
}

const morphAttribute = (target, key, value, meta, listeners) => {
  const remove = value == null || value === false

  if (key.indexOf('on') === 0) {
    const type = key.substring(2)

    readMeta(target, meta)

    meta[type] = remove ? null : value

    if (!remove && !listeners.includes(type)) {
      listeners.push(type)

      addListener(target.ownerDocument, type)
    }
  } else {
    if (remove) {
      target.removeAttribute(key)
    } else {
      const stringified = value === true ? '' : value

      if (target.getAttribute(key) !== stringified) {
        target.setAttribute(key, stringified)
      }
    }

    if (key === 'value' || value === true || value === false) {
      if (target[key] !== value) {
        target[key] = value
      }
    }
  }
}

const morphChild = (
  target,
  childNode,
  next,
  variables,
  isSameView,
  listeners
) => {
  const document = target.ownerDocument

  const append = childNode == null

  let replace = false

  let currentChild = childNode

  if (next.type === 'text') {
    if (!append && childNode.nodeType !== 3) {
      replace = true
    }

    if (append || replace) {
      currentChild = document.createTextNode(next.value)
    } else if (childNode.data !== next.value) {
      childNode.data = next.value
    }
  } else {
    const tag = next.tag

    if (
      !append &&
      (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== tag)
    ) {
      replace = true
    }

    if (append || replace) {
      const isSvg = tag === 'svg' || target.namespaceURI === svgNamespace

      currentChild = isSvg
        ? document.createElementNS(svgNamespace, tag)
        : document.createElement(tag)
    }

    if (next.view != null) {
      morphRoot(currentChild, next, listeners)
    } else if (!isSameView || next.dynamic) {
      morph(currentChild, next, variables, isSameView, {}, listeners)
    }
  }

  if (append) {
    target.append(currentChild)
  } else if (replace) {
    childNode.replaceWith(currentChild)
  }

  if (currentChild != null && next.afterUpdate) {
    next.afterUpdate(currentChild)
  }

  return getNextSibling(currentChild)
}

const morph = (target, next, variables, isSameView, meta, listeners) => {
  const attributesLength = next.attributes.length

  const attrNames = []

  if (attributesLength) {
    for (let i = 0, length = attributesLength; i < length; i++) {
      const attribute = next.attributes[i]

      if (!isSameView || attribute.variable) {
        let value = attribute.value

        if (attribute.variable) {
          value = variables[value]
        }

        if (attribute.key) {
          morphAttribute(target, attribute.key, value, meta, listeners)

          attrNames.push(attribute.key)
        } else {
          const keys = Object.keys(value)

          for (let i = 0, len = keys.length; i < len; i++) {
            const key = keys[i]

            morphAttribute(target, key, value[key], meta, listeners)

            attrNames.push(key)
          }
        }
      }
    }
  }

  if (!isSameView) {
    for (const attr of target.attributes) {
      if (!~attrNames.indexOf(attr.name)) {
        target.removeAttribute(attr.name)
      }
    }
  }

  const childrenLength = next.children.length
  let childNode = target.firstChild

  if (childrenLength) {
    let deopt = !isSameView

    for (let childIndex = 0; childIndex < childrenLength; childIndex++) {
      let child = next.children[childIndex]

      if (!deopt && !child.dynamic && !child.variable) {
        childNode = getNextSibling(childNode)
      } else {
        deopt = true

        if (child.variable) {
          const variableValue = child.value

          child = variables[variableValue]

          if (child?.[Symbol.iterator] == null || typeof child === 'string') {
            child = [child]
          }

          for (let grand of child) {
            grand = resolve(grand)

            if (grand == null) grand = ''

            if (grand.type == null) {
              grand = {type: 'text', value: grand}
            }

            if (isSameView && grand.view != null && !grand.dynamic) {
              childNode = getNextSibling(childNode)
            } else {
              childNode = morphChild(
                target,
                childNode,
                grand,
                variables,
                isSameView,
                listeners
              )
            }
          }
        } else {
          childNode = morphChild(
            target,
            childNode,
            child,
            variables,
            isSameView,
            listeners
          )
        }
      }
    }
  }

  if (childNode) {
    let nextChild

    do {
      nextChild = getNextSibling(childNode)

      childNode.remove()

      childNode = nextChild
    } while (childNode)
  }

  if (meta._read) {
    weakMap.set(target, meta)
  }
}

const morphRoot = (target, next, listeners) => {
  if (next.view === 0) {
    return
  }

  const meta = readMeta(target)

  const isSameView = next.view === meta.view

  if (!isSameView) {
    meta.view = next.view
  }

  if (!isSameView || next.dynamic) {
    morph(target, next, next.variables, isSameView, meta, listeners)
  }
}

export const createDomView = (target, view) => {
  const listeners = []

  return (state) => {
    const current = resolve(view(state))

    morphRoot(target, current, listeners)

    if (current.afterUpdate) {
      current.afterUpdate(target)
    }
  }
}
