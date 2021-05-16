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

      map?.[type]?.(e)
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

  let mode = !isExistingElement || childNode == null ? 2 : !isSameView ? 1 : 0

  let currentChild = childNode

  if (next.type === tokenTypes.text) {
    if (!mode && childNode.nodeType !== 3) {
      mode = 1
    }

    if (mode) {
      currentChild = document.createTextNode(next.value)
    } else if (childNode.data !== next.value) {
      childNode.data = next.value
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
      const isSvg = next.tag === 'svg' || target.namespaceURI === svgNamespace

      currentChild = isSvg
        ? document.createElementNS(svgNamespace, next.tag)
        : document.createElement(next.tag)
    }

    if (next.view) {
      morphRoot(currentChild, next, !mode)
    } else if (mode || next.dynamic) {
      morph(currentChild, next, variables, !mode, isSameView)
    }
  }

  if (mode === 2) {
    target.appendChild(currentChild)
  } else if (mode === 1) {
    target.replaceChild(currentChild, childNode)
  }

  return getNextSibling(currentChild)
}

const morph = (target, next, variables, isExistingElement, isSameView) => {
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
      const keys = Object.keys(value)

      for (let i = 0, len = keys.length; i < len; i++) {
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
      const variableValue = child.value

      child = variables[variableValue]

      if (!Array.isArray(child)) {
        child = [child]
      }
    } else {
      child = [child]
    }

    for (let i = 0; i < child.length; i++) {
      let grand = child[i]

      if (!grand?.type) {
        grand = {type: tokenTypes.text, value: grand ?? ''}
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

  if (childNode) {
    let nextChild

    do {
      nextChild = getNextSibling(childNode)

      target.removeChild(childNode)

      childNode = nextChild
    } while (childNode)
  }
}

const morphRoot = (target, next, isExistingElement = true) => {
  const meta = readMeta(target)

  const isSameView = next.view === meta.view
  let doMorph = next.dynamic

  if (!isExistingElement || !isSameView) {
    meta.view = next.view

    doMorph = true
  }

  if (doMorph) {
    morph(target, next, next.variables, isExistingElement, isSameView)
  }
}

export const createDomView = (target, view) => (state) => {
  const current = view(state)

  morphRoot(target, current)
}
