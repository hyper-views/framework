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

const addListener = (document, type) => {
  document.addEventListener(
    type,
    (e) => {
      const map = weakMap.get(e.target)

      map?.[type]?.(e)
    },
    {capture: true}
  )
}

const morphAttribute = (target, key, value, isExistingElement) => {
  const remove = isExistingElement && value == null

  if (key.charAt(0) === '@') {
    const type = key.substring(1)

    const meta = readMeta(target)

    meta[type] = value

    if (!remove) {
      const document = target.ownerDocument

      const listeners = readMeta(document)

      if (!listeners[type]) {
        listeners[type] = true

        addListener(document, type)
      }
    }
  } else if (remove) {
    target.removeAttribute(key)
  } else if (value === true || value === false || key === 'value') {
    if (target[key] !== value) {
      target[key] = value
    }
  } else if (value != null && target.getAttribute(key) !== value) {
    target.setAttribute(key, value)
  }
}

const morph = (
  target,
  next,
  variables,
  isExistingElement = true,
  isSameView = true
) => {
  if (next.view) {
    const meta = readMeta(target)

    isSameView = next.view === meta.view

    if (next.dynamic || !isExistingElement || !isSameView) {
      meta.view = next.view

      variables = next.variables
    } else {
      return
    }
  }

  let attributeIndex = 0

  if (isExistingElement && isSameView) {
    attributeIndex = next.attributes.offset ?? 0
  }

  for (
    const length = next.attributes.length;
    attributeIndex < length;
    attributeIndex++
  ) {
    const attribute = next.attributes[attributeIndex]

    let value = attribute.value

    if (attribute.type === tokenTypes.variable) {
      value = variables[value]
    }

    if (attribute.key) {
      morphAttribute(target, attribute.key, value, isExistingElement)
    } else {
      for (
        let i = 0, keys = Object.keys(value), len = keys.length;
        i < len;
        i++
      ) {
        const key = keys[i]

        morphAttribute(target, key, value[key], isExistingElement)
      }
    }
  }

  let childNode

  let childIndex = 0

  if (isExistingElement && isSameView) {
    childIndex = next.children.offset ?? 0

    childNode = target.childNodes[childIndex]
  } else {
    childNode = target.firstChild
  }

  for (const length = next.children.length; childIndex < length; childIndex++) {
    let child = next.children[childIndex]

    if (child.type === tokenTypes.variable) {
      child = variables[child.value]
    }

    if (!Array.isArray(child)) {
      child = [child]
    }

    for (let i = 0; i < child.length; i++) {
      const next = child[i]

      const document = target.ownerDocument

      let mode =
        !isExistingElement || childNode == null ? 2 : !isSameView ? 1 : 0

      let currentChild = childNode

      if (!next?.type || next.type === tokenTypes.text) {
        if (!mode && childNode.nodeType !== 3) {
          mode = 1
        }

        const value = next?.value ?? next ?? ''

        if (mode) {
          currentChild = document.createTextNode(value)
        } else if (childNode.data !== value) {
          childNode.data = value
        }
      } else {
        if (
          !mode &&
          (childNode.nodeType !== 1 ||
            childNode.nodeName.toLowerCase() !== next.tag)
        ) {
          mode = 1
        }

        if (mode) {
          const isSvg =
            next.tag === 'svg' || target.namespaceURI === svgNamespace

          currentChild = isSvg
            ? document.createElementNS(svgNamespace, next.tag)
            : document.createElement(next.tag)
        }

        if (next.view || mode || next.dynamic) {
          morph(currentChild, next, variables, !mode, isSameView)
        }
      }

      if (mode === 2) {
        target.appendChild(currentChild)
      } else if (mode === 1) {
        target.replaceChild(currentChild, childNode)
      }

      childNode = currentChild?.nextSibling
    }
  }

  if (childNode) {
    let nextChild

    do {
      nextChild = childNode?.nextSibling

      target.removeChild(childNode)

      childNode = nextChild
    } while (childNode)
  }
}

export const createDOMView = (target, view) => (state) => {
  morph(target, view(state))
}
