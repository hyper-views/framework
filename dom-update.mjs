/* global window, document */

const defaultDom = {
  tag: null,
  attributes: {},
  children: []
}

const hooks = ['onmount', 'onupdate']
const booleanAttributes = ['selected', 'checked', 'disabled']

const fromHTML = (html) => {
  const div = document.createElement('div')

  div.innerHTML = html

  return div.childNodes
}

const callAsync = (fn, target) => {
  setTimeout(() => fn.call(target), 0)
}

export default (target, w = window) => {
  const raf = w.requestAnimationFrame

  const morph = (target, next, previous) => {
    const targetNamespace = target.namespaceURI
    const document = target.ownerDocument

    if (!previous) {
      previous = defaultDom
    }

    const usedAttributes = []

    const nextAttrs = Object.keys(next.attributes)

    for (let i = 0; i < nextAttrs.length; i++) {
      const key = nextAttrs[i]

      usedAttributes.push(key)

      const val = next.attributes[key]

      if (booleanAttributes.includes(key)) {
        target[key] = val

        if (val) {
          target.setAttribute(key, '')
        } else {
          target.removeAttribute(key)
        }
      } else if (key === 'value') {
        target.value = val

        target.setAttribute('value', val)
      } else if (val !== previous.attributes[key]) {
        if (!hooks.includes(key)) {
          if (key.startsWith('on')) {
            target[key] = val
          } else {
            target.setAttribute(key, val)
          }
        }
      }
    }

    const unusedAttrs = Object.keys(previous.attributes).filter((key) => !usedAttributes.includes(key))

    for (let i = 0; i < unusedAttrs.length; i++) {
      const key = unusedAttrs[i]

      if (!hooks.includes(key)) {
        if (key.startsWith('on')) {
          delete target[key]
        } else {
          if (key === 'value') {
            target.value = ''
          } else if (booleanAttributes.includes(key)) {
            target[key] = false
          }

          target.removeAttribute(key)
        }
      }
    }

    for (let i = 0; i < next.children.length; i++) {
      if (next.children[i].html != null) {
        next.children.splice(i, 1, ...fromHTML(next.children[i].html))
      }

      if (previous.children[i] != null && previous.children[i].html != null) {
        previous.children.splice(i, 1, ...fromHTML(previous.children[i].html))
      }

      const nextChild = next.children[i]
      const previousChild = previous.children[i]
      const childNode = target.childNodes[i]
      const shouldAppendChild = childNode == null

      if (typeof nextChild !== 'object') {
        if (shouldAppendChild) {
          const el = document.createTextNode(nextChild)

          target.appendChild(el)
        } else if (nextChild !== previousChild) {
          childNode.nodeValue = nextChild
        }

        continue
      }

      if (nextChild instanceof w.Element || nextChild instanceof w.Text) {
        if (shouldAppendChild) {
          target.appendChild(nextChild)
        } else {
          target.replaceChild(nextChild, childNode)
        }

        continue
      }

      const nextNamespace = typeof nextChild === 'object' && nextChild.attributes.xmlns != null ? nextChild.attributes.xmlns : targetNamespace

      const shouldReplaceChild = !shouldAppendChild && (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== nextChild.tag)
      let el

      if (shouldAppendChild || shouldReplaceChild) {
        el = document.createElementNS(nextNamespace, nextChild.tag)

        el = morph(el, nextChild)

        if (shouldAppendChild) {
          target.appendChild(el)
        } else if (shouldReplaceChild) {
          target.replaceChild(el, childNode)
        }

        if (typeof nextChild === 'object') {
          if (nextChild.attributes.onmount) {
            callAsync(nextChild.attributes.onmount, el)
          }

          if (nextChild.attributes.onupdate) {
            callAsync(nextChild.attributes.onupdate, el)
          }
        }
      } else {
        el = childNode

        morph(el, nextChild, previousChild)

        if (typeof nextChild === 'object' && nextChild.attributes.onupdate) {
          callAsync(nextChild.attributes.onupdate, el)
        }
      }
    }

    while (target.childNodes.length > next.children.length) {
      target.removeChild(target.childNodes[next.children.length])
    }

    return target
  }

  let called = false
  let previous

  return (next) => {
    if (!called) {
      called = true

      raf(() => {
        morph(target, next, previous)

        if (previous == null) {
          if (typeof next === 'object' && next.attributes.onmount) {
            callAsync(next.attributes.onmount, target)
          }
        }

        if (typeof next === 'object' && next.attributes.onupdate) {
          callAsync(next.attributes.onupdate, target)
        }

        called = false

        previous = next
      })
    }
  }
}
