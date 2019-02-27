/* global window */

const defaultDom = {
  tag: null,
  attributes: {},
  children: []
}

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

      const val = next.attributes[key]

      if (typeof val === 'boolean') {
        target[key] = val

        if (val) {
          target.setAttribute(key, '')

          usedAttributes.push(key)
        }
      } else {
        usedAttributes.push(key)

        if (key.startsWith('on')) {
          target[key] = val
        } else {
          if (val !== previous.attributes[key]) {
            target.setAttribute(key, val)
          }

          if (key === 'value') {
            target[key] = val
          }
        }
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

      const isText = typeof nextChild !== 'object'
      const isHTML = nextChild instanceof w.Element || nextChild instanceof w.Text

      let append = false
      let replace = false

      if (childNode == null) {
        append = true
      } else if (isText && nextChild === previousChild) {
        continue
      } else if (isHTML && childNode.isEqualNode(nextChild)) {
        continue
      }

      if (isText || isHTML) {
        replace = !append
      } else if (childNode != null && (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== nextChild.tag)) {
        replace = true
      }

      if (append || replace) {
        let el

        if (isText) {
          el = document.createTextNode(nextChild)
        } else if (isHTML) {
          el = nextChild
        } else {
          el = document.createElementNS(nextChild.attributes.xmlns != null ? nextChild.attributes.xmlns : targetNamespace, nextChild.tag)

          el = morph(el, nextChild)
        }

        if (append) {
          target.appendChild(el)
        } else {
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
