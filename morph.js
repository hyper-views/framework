const defaultDom = {
  tag: null,
  attributes: {},
  children: []
}

module.exports = () => {
  let previous

  return (target, next) => {
    let result = morph(target, next, previous)

    previous = next

    return result
  }

  function morph (target, next, previous) {
    if (!previous) {
      previous = defaultDom
    }

    const usedAttributes = []

    const nextAttrs = Object.keys(next.attributes)

    for (let i = 0; i < nextAttrs.length; i++) {
      const key = nextAttrs[i]

      usedAttributes.push(key)

      const val = next.attributes[key]

      if (val !== previous.attributes[key]) {
        if (key.startsWith('on')) {
          target[key] = val
        } else {
          target.setAttribute(key, val === true ? key : val)
        }
      }
    }

    const unusedAttrs = Object.keys(previous.attributes).filter((key) => !usedAttributes.includes(key))

    for (let i = 0; i < unusedAttrs.length; i++) {
      const key = unusedAttrs[i]

      if (key.startsWith('on')) {
        delete target[key]
      } else {
        target.removeAttribute(key)
      }
    }

    let i = 0

    for (; i < next.children.length; i++) {
      if (typeof next.children[i] !== 'object') {
        const el = document.createTextNode(next.children[i])

        if (target.childNodes[i] == null) {
          target.appendChild(el)
        } else if (next.children[i] !== previous.children[i]) {
          target.replaceChild(el, target.childNodes[i])
        }
      } else if (target.childNodes[i] == null) {
        let el = document.createElement(next.children[i].tag)

        target.appendChild(morph(el, next.children[i], previous.children[i]))
      } else {
        let el = target.childNodes[i]

        if (target.childNodes[i].nodeType !== 1 || (next.children[i].tag !== previous.children[i].tag && previous.children[i].tag != null)) {
          el = document.createElement(next.children[i].tag)

          target.replaceChild(el, target.childNodes[i])
        }

        morph(el, next.children[i], previous.children[i])
      }
    }

    for (; i < target.childNodes.length; i++) {
      target.childNodes[i].remove()
    }

    return target
  }
}
