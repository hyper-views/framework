/* global window */

const defaultDom = {
  tag: null,
  attributes: {},
  children: []
}

const SHOULD_APPEND = 0b0001
const SHOULD_REPLACE = 0b0010
const IS_TEXT = 0b0100
const IS_HTML = 0b1000

export default (target, w = window) => {
  const raf = w.requestAnimationFrame
  const document = target.ownerDocument

  const fromHTML = (html) => {
    const div = document.createElement('div')

    div.innerHTML = html

    return div.childNodes
  }

  const morph = (target, next, previous) => {
    const targetNamespace = target.namespaceURI

    if (!previous) {
      previous = defaultDom
    }

    const usedAttributes = []

    const nextAttrs = Object.keys(next.attributes)

    let i

    i = -1

    while (++i < nextAttrs.length) {
      const key = nextAttrs[i]

      usedAttributes.push(key)

      let val = next.attributes[key]
      let set = true
      let remove = false

      if (typeof val === 'boolean') {
        target[key] = val

        if (val) {
          val = ''
        } else {
          remove = true
        }
      } else if (key === 'value') {
        target.value = val
      } else if (val !== previous.attributes[key]) {
        if (key.startsWith('on')) {
          target[key] = val

          set = false
        }
      } else {
        set = false
      }

      if (set && !remove) {
        target.setAttribute(key, val)
      } else if (remove) {
        target.removeAttribute(key)
      }
    }

    const prevAttrs = Object.keys(previous.attributes)

    i = -1

    while (++i < prevAttrs.length) {
      const key = prevAttrs[i]

      if (usedAttributes.includes(key)) {
        continue
      }

      if (key.startsWith('on')) {
        target[key] = null
      } else {
        if (key === 'value') {
          target.value = ''
        } else if (typeof previous.attributes[key] === 'boolean') {
          target[key] = false
        }

        target.removeAttribute(key)
      }
    }

    i = -1

    while (++i < next.children.length) {
      if (next.children[i].html != null) {
        next.children.splice(i, 1, ...fromHTML(next.children[i].html))
      }

      const nextChild = next.children[i]
      const previousChild = previous.children[i]
      const childNode = target.childNodes[i]
      let mode = 0b0000

      if (typeof nextChild !== 'object') {
        mode = IS_TEXT
      } else if (nextChild instanceof w.Element || nextChild instanceof w.Text) {
        mode = IS_HTML
      }

      if (childNode == null) {
        mode |= SHOULD_APPEND
      } else if (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== nextChild.tag) {
        mode |= SHOULD_REPLACE
      }

      if (mode & (SHOULD_APPEND | SHOULD_REPLACE)) {
        let el

        if (mode & IS_TEXT) {
          el = document.createTextNode(nextChild)
        } else if (mode & IS_HTML) {
          el = nextChild
        } else {
          el = document.createElementNS(nextChild.attributes.xmlns != null ? nextChild.attributes.xmlns : targetNamespace, nextChild.tag)

          el = morph(el, nextChild)
        }

        if (mode & SHOULD_APPEND) {
          target.appendChild(el)
        } else if (mode & SHOULD_REPLACE) {
          target.replaceChild(el, childNode)
        }
      } else {
        morph(childNode, nextChild, previousChild)
      }
    }

    while (target.childNodes.length > next.children.length) {
      target.removeChild(target.childNodes[next.children.length])
    }

    return target
  }

  let called = false
  let previous
  let next

  return (current) => {
    next = current

    if (!called) {
      called = true

      raf(() => {
        morph(target, next, previous)

        called = false

        previous = next
      })
    }
  }
}
