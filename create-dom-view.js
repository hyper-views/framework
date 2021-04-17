const svgNamespace = 'http://www.w3.org/2000/svg'

const weakMap = new WeakMap()

const readMeta = (target) => {
  let result = weakMap.get(target)

  if (!result) {
    result = {}

    weakMap.set(target, result)
  }

  return result
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

const morphAttribute = (target, key, value) => {
  const remove = value == null || value === false

  if (key.indexOf('on') === 0) {
    const type = key.substring(2)

    const meta = readMeta(target)

    meta[type] = value

    if (!remove) {
      const listeners = readMeta(target.ownerDocument)

      if (!listeners[type]) {
        listeners[type] = true

        addListener(target.ownerDocument, type)
      }
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

const morphChild = (target, childNode, next, variables, isSameView) => {
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
    if (
      !append &&
      (childNode.nodeType !== 1 ||
        childNode.nodeName.toLowerCase() !== next.tag)
    ) {
      replace = true
    }

    if (append || replace) {
      const isSvg = next.tag === 'svg' || target.namespaceURI === svgNamespace

      currentChild = isSvg
        ? document.createElementNS(svgNamespace, next.tag)
        : document.createElement(next.tag)
    }

    if (next.view != null) {
      morphRoot(currentChild, next)
    } else if (!isSameView || next.dynamic) {
      morph(currentChild, next, variables, isSameView)
    }
  }

  if (append) {
    target.appendChild(currentChild)
  } else if (replace) {
    childNode.replaceWith(currentChild)
  }

  return getNextSibling(currentChild)
}

const morph = (target, next, variables, isSameView) => {
  const attributesLength = next.attributes.length

  const attrNames = []

  for (let i = 0, length = attributesLength; i < length; i++) {
    const attribute = next.attributes[i]

    if (!isSameView || attribute.variable) {
      let value = attribute.value

      if (attribute.variable) {
        value = variables[value]
      }

      if (attribute.key) {
        morphAttribute(target, attribute.key, value)

        attrNames.push(attribute.key)
      } else {
        const keys = Object.keys(value)

        for (let i = 0, len = keys.length; i < len; i++) {
          const key = keys[i]

          morphAttribute(target, key, value[key])

          attrNames.push(key)
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

        if (typeof child === 'string' || child?.[Symbol.iterator] == null) {
          child = [child]
        }
      } else {
        child = [child]
      }

      for (let grand of child) {
        if (grand == null || grand.type == null) {
          grand = {type: 'text', value: grand == null ? '' : grand}
        }

        childNode = morphChild(target, childNode, grand, variables, isSameView)
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
}

const morphRoot = (target, next) => {
  const meta = readMeta(target)

  const isSameView = next.view === meta.view

  if (!isSameView) {
    meta.view = next.view
  }

  if (!isSameView || next.dynamic) {
    morph(target, next, next.variables, isSameView)
  }
}

export const createDomView = (target, view) => (state) => {
  const current = view(state)

  morphRoot(target, current)
}
