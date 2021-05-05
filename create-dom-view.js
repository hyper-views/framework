import {tokenTypes} from './html.js'

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

const morphAttribute = (target, key, value, isExistingElement) => {
  const remove = value == null || value === false

  if (key.charAt(0) === '@') {
    const type = key.substring(1)

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
    if (isExistingElement && remove) {
      target.removeAttribute(key)
    } else if (!remove) {
      const stringified = value === true ? '' : String(value)

      if (!isExistingElement || target.getAttribute(key) !== stringified) {
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
  isExistingElement,
  isSameView
) => {
  const document = target.ownerDocument

  const append = !isExistingElement || childNode == null

  let replace = false

  let currentChild = childNode

  if (next.type === tokenTypes.text) {
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
      morphRoot(currentChild, next, !(append || replace))
    } else if (append || replace || !isSameView || next.dynamic) {
      morph(currentChild, next, variables, !(append || replace), isSameView)
    }
  }

  if (append) {
    target.appendChild(currentChild)
  } else if (replace) {
    childNode.replaceWith(currentChild)
  }

  return getNextSibling(currentChild)
}

const morph = (target, next, variables, isExistingElement, isSameView) => {
  const attributesLength = next.attributes.length

  const attrNames = []

  if (!isExistingElement || !isSameView || next.dynamic & 0b01) {
    for (let i = 0, length = attributesLength; i < length; i++) {
      const attribute = next.attributes[i]

      if (
        !isExistingElement ||
        !isSameView ||
        attribute.type === tokenTypes.variable
      ) {
        let value = attribute.value

        if (attribute.type === tokenTypes.variable) {
          value = variables[value]
        }

        if (attribute.key) {
          morphAttribute(target, attribute.key, value, isExistingElement)

          attrNames.push(attribute.key)
        } else {
          const keys = Object.keys(value)

          for (let i = 0, len = keys.length; i < len; i++) {
            const key = keys[i]

            morphAttribute(target, key, value[key], isExistingElement)

            attrNames.push(key)
          }
        }
      }
    }
  }

  if (isExistingElement && !isSameView) {
    for (const attr of target.attributes) {
      if (!~attrNames.indexOf(attr.name)) {
        target.removeAttribute(attr.name)
      }
    }
  }

  const childrenLength = next.children.length

  let childNode = target.firstChild

  let skip = isExistingElement && isSameView

  if (!isExistingElement || !isSameView || next.dynamic & 0b10) {
    for (let childIndex = 0; childIndex < childrenLength; childIndex++) {
      let child = next.children[childIndex]

      if (skip && !child.dynamic && child.type !== tokenTypes.variable) {
        childNode = getNextSibling(childNode)
      } else {
        skip = false

        if (child.type === tokenTypes.variable) {
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
            grand = {type: tokenTypes.text, value: grand == null ? '' : grand}
          }

          childNode = morphChild(
            target,
            childNode,
            grand,
            variables,
            isExistingElement,
            isSameView
          )
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
}

const morphRoot = (target, next, isExistingElement = true) => {
  const meta = readMeta(target)

  const isSameView = next.view === meta.view

  if (!isExistingElement || !isSameView) {
    meta.view = next.view
  }

  if (!isExistingElement || !isSameView || next.dynamic) {
    morph(target, next, next.variables, isExistingElement, isSameView)
  }
}

export const createDomView = (target, view) => (state) => {
  const current = view(state)

  morphRoot(target, current)
}
