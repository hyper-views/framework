const svgNamespace = 'http://www.w3.org/2000/svg'

const xlinkNamespace = 'http://www.w3.org/1999/xlink'

const xhtmlNamespace = 'http://www.w3.org/1999/xhtml'

const weakMap = new WeakMap()

const getMeta = (target, fallback = {}) => weakMap.get(target) || fallback

const setMeta = (target, meta) => weakMap.set(target, meta)

const attrToProp = {
  class: 'className',
  for: 'htmlFor'
}

const resolve = (obj) => {
  let afterUpdate

  if (typeof obj === 'function') {
    obj = obj((cb) => {
      afterUpdate = cb
    })

    if (afterUpdate != null) {
      obj.afterUpdate = afterUpdate
    }
  }

  return obj
}

export const skipUpdate = () => {
  return {
    view: 0,
    dynamic: false
  }
}

const morphAttribute = (target, key, value, meta) => {
  const remove = value == null || value === false

  if (key.indexOf('on') === 0) {
    const type = key.substring(2)

    if (!meta.read) {
      Object.assign(meta, getMeta(target))

      meta.read = true
    }

    if (remove) {
      if (meta[key]) {
        target.removeEventListener(type, meta[key].proxy)

        meta[key] = null
      }
    } else if (meta[key]) {
      meta[key].handler = value
    } else {
      meta[key] = {
        proxy(...args) {
          const event = getMeta(target)[key]

          if (event) {
            event.handler.apply(this, args)
          }
        },
        handler: value
      }

      target.addEventListener(type, meta[key].proxy)
    }
  } else {
    if (remove) {
      target.removeAttribute(key)
    }

    const namespace = key.indexOf('xlink:') === 0 ? xlinkNamespace : null

    if (!namespace && target.namespaceURI !== svgNamespace && key.indexOf('data-') !== 0) {
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
  let childNode = target.childNodes[index]

  if (next == null) {
    return 0
  }

  if (same && next.view != null && !next.dynamic) {
    return 1
  }

  const document = target.ownerDocument

  if (next.type === 'html') {
    const div = document.createElement('div')

    div.innerHTML = next.html

    const length = div.childNodes.length

    for (let offset = 0; offset < length; offset++) {
      const node = div.firstChild

      if (childNode == null) {
        target.append(node)
      } else {
        if (!childNode.isEqualNode(node)) {
          childNode.replaceWith(node)

          childNode = node
        } else {
          node.remove()
        }

        childNode = childNode.nextSibling
      }
    }

    return length
  }

  const append = childNode == null

  let replace = false

  let newChild
  let t

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
    const tag = next.tag

    if (!append && (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== tag)) {
      replace = true
    }

    if (append || replace) {
      const namespace = tag === 'svg' ? svgNamespace : target.namespaceURI

      newChild = namespace !== xhtmlNamespace ? document.createElementNS(namespace, tag) : document.createElement(tag)
    }

    t = newChild || childNode

    if (next.view != null) {
      morphRoot(t, next)
    } else {
      const meta = {read: false}

      morph(t, next, variables, same, meta)
    }
  }

  if (append) {
    target.append(newChild)
  } else if (replace) {
    childNode.replaceWith(newChild)
  }

  if (t != null && next.afterUpdate) {
    next.afterUpdate(t)
  }

  return 1
}

const morph = (target, next, variables, same, meta) => {
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
        morphAttribute(target, attribute.key, value, meta)
      } else {
        for (const key of Object.keys(value)) {
          morphAttribute(target, key, value[key], meta)
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

        if (!Array.isArray(child)) {
          child = [child]
        }

        for (let grandIndex = 0, length = child.length; grandIndex < length; grandIndex++) {
          let grand = child[grandIndex]

          if (child[grandIndex] == null) continue

          grand = resolve(grand)

          if (grand != null && grand.type == null) {
            grand = {type: 'text', text: grand}
          }

          result += morphChild(target, result, grand, variables, same)
        }
      } else {
        result += morphChild(target, result, child, variables, same)
      }
    }

    childrenLength = result
  }

  while (target.childNodes.length > childrenLength) {
    target.lastChild.remove()
  }

  setMeta(target, meta)
}

const morphRoot = (target, next) => {
  const meta = getMeta(target)

  meta.read = true

  const same = next.view === 0 || next.view === meta.view

  if (same && next.view != null && !next.dynamic) {
    return
  }

  if (!same) {
    meta.view = next.view
  }

  morph(target, next, next.variables, same, meta)
}

export const domUpdate = (target) => (current) => {
  setTimeout(() => {
    current = resolve(current)

    if (Array.isArray(current)) {
      current = {
        type: 'node',
        tag: target.nodeName.toLowerCase(),
        dynamic: true,
        attributes: [],
        children: current
      }
    }

    morphRoot(target, current)

    if (current.afterUpdate) {
      current.afterUpdate(target)
    }
  }, 0)
}

export const raw = (html) => {
  return {type: 'html', html}
}

const isInCharSet = (char, chars) => char && chars.indexOf(char) !== -1
const isNameChar = (char) => !isInCharSet(char, ' \t\n\r\'"=</>')
const isSpaceChar = (char) => isInCharSet(char, ' \t\n\r')
const isQuoteChar = (char) => isInCharSet(char, '\'"')

const tokenizer = {
  * get(acc, strs, vlength) {
    for (let index = 0; index < strs.length; index++) {
      const str = strs[index]

      yield * this.tokenize(acc, str, index > 0)

      if (index < vlength) {
        yield {
          type: 'variable',
          value: index
        }
      }
    }
  },
  * tokenize(acc, str, first) {
    let tag = acc.tag
    let i = 0

    const current = () => str.charAt(i)
    const next = () => str.charAt(i + 1)

    while (current()) {
      if (!tag && current() === '<') {
        let value = ''
        let end = false

        if (next() === '/') {
          end = true

          i++
        }

        while (next() && isNameChar(next())) {
          i++

          value += current()
        }

        yield {
          type: !end ? 'tag' : 'endtag',
          value
        }

        first = false

        tag = value

        i++

        continue
      }

      if (tag && isSpaceChar(current())) {
        i++

        continue
      }

      if (tag && current() === '/' && next() === '>') {
        yield * [
          {
            type: 'end',
            value: tag
          },
          {
            type: 'endtag',
            value: tag
          },
          {
            type: 'end',
            value: tag
          }
        ]

        first = false

        tag = false

        i += 2

        continue
      }

      if (tag && current() === '>') {
        yield {
          type: 'end',
          value: ''
        }

        first = false

        tag = false

        i++

        continue
      }

      if (tag && isNameChar(current())) {
        let value = ''

        i--

        while (next() && isNameChar(next())) {
          i++

          value += current()
        }

        yield {
          type: 'key',
          value
        }

        first = false

        if (next() === '=') {
          i++

          let quote = ''
          let value = ''

          if (isQuoteChar(next())) {
            i++

            quote = current()

            while (next() && next() !== quote) {
              i++

              value += current()
            }

            i++

            yield {
              type: 'value',
              value
            }
          } else if (next()) {
            while (next() && !isSpaceChar(next()) && next() !== '>') {
              i++

              value += current()
            }

            if (next() !== '>') i++

            yield {
              type: 'value',
              value
            }
          }
        } else {
          yield {
            type: 'value',
            value: true
          }
        }

        i++

        continue
      }

      if (!tag) {
        let value = ''

        while (current() && current() !== '<') {
          value += current()

          i++
        }

        let trim = true

        if (!current() && first) {
          trim = false
        }

        if ((!trim && value) || (trim && value.trim())) {
          yield {
            type: 'text',
            value
          }
        }

        continue
      }

      i++
    }

    acc.tag = tag
  }
}

const parse = (tokens, parent, tag) => {
  const child = {
    type: 'node',
    tag,
    dynamic: false,
    attributes: [],
    children: []
  }

  let current

  for (;;) {
    current = tokens.next()

    if (current.done) break

    const token = current.value

    if (token.type === 'end') {
      break
    } else if (token.type === 'key') {
      const next = (tokens.next() || {value: true}).value

      if (next.type === 'value') {
        child.attributes.push({key: token.value, value: next.value})
      } else {
        const value = next.value

        child.dynamic = true

        child.attributes.push({
          key: token.value,
          variable: true,
          value
        })
      }
    } else if (token.type === 'variable') {
      child.dynamic = true

      child.attributes.push({
        key: false,
        variable: true,
        value: token.value
      })
    }
  }

  for (;;) {
    current = tokens.next()

    if (current.done) break

    const token = current.value

    if (token.type === 'endtag' && token.value === child.tag) {
      break
    } else if (token.type === 'tag') {
      const d = parse(tokens, child, token.value)

      child.dynamic = child.dynamic || d
    } else if (token.type === 'text') {
      child.children.push({
        type: 'text',
        text: token.value
      })
    } else if (token.type === 'variable') {
      child.dynamic = true

      child.children.push({
        type: 'variable',
        variable: true,
        value: token.value
      })
    }
  }

  parent.children.push(child)

  return child.dynamic
}

let view = 1

const create = (strs, vlength) => {
  const acc = {
    tag: false
  }

  const tokens = tokenizer.get(acc, strs, vlength)

  const children = []

  let current

  for (;;) {
    current = tokens.next()

    if (current.done) break

    const token = current.value

    if (token.type === 'tag') {
      parse(tokens, {children}, token.value)
    } else if (token.type === 'text') {
      children.push({text: token.value})
    }
  }

  return {view: view++, children}
}

export const html = (strs, ...variables) => {
  let result = getMeta(strs, false)

  if (!result) {
    result = create(strs, variables.length)

    setMeta(strs, result)
  }

  if (result.children.length > 1) {
    return {...result, variables}
  }

  return {...result.children[0], view: result.view, variables}
}

export const render = ({state, component, update}) => {
  const commit = (produce) => {
    state = produce(state)

    update(component({state, commit}))
  }

  commit((state) => state)

  return commit
}
