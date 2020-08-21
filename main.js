const svgNamespace = 'http://www.w3.org/2000/svg'

const weakMap = new WeakMap()

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

const viewZero = {
  type: 'node',
  view: 0,
  dynamic: false
}

export const skipUpdate = () => viewZero

const morphAttribute = (target, key, value, meta) => {
  const remove = value == null || value === false

  if (key.indexOf('on') === 0) {
    const type = key.substring(2)

    if (!meta.read) {
      Object.assign(meta, weakMap.get(target) || {})

      meta.read = true
    }

    if (remove) {
      if (meta[key]) {
        target.removeEventListener(type, meta[key].delegate)

        meta[key] = null
      }
    } else if (meta[key]) {
      meta[key].handler = value
    } else {
      meta[key] = {
        delegate(...args) {
          const event = (weakMap.get(target) ?? {})[key]

          if (event) {
            event.handler.apply(this, args)
          }
        },
        handler: value
      }

      target.addEventListener(type, meta[key].delegate)
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

const morphChild = (target, childNode, next, variables, same) => {
  const document = target.ownerDocument

  const append = childNode == null

  let replace = false

  let newChild
  let t

  if (next.type === 'text') {
    if (!append && childNode.nodeType !== 3) {
      replace = true
    }

    if (append || replace) {
      newChild = document.createTextNode(next.value)
    } else if (childNode.data !== next.value) {
      childNode.data = next.value
    }

    t = newChild ?? childNode
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

      newChild = isSvg
        ? document.createElementNS(svgNamespace, tag)
        : document.createElement(tag)
    }

    t = newChild ?? childNode

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

  return t?.nextSibling
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

  let childNode = target.firstChild

  if (next.children.length) {
    const length = next.children.length
    let deopt = !same

    for (let childIndex = 0; childIndex < length; childIndex++) {
      let child = next.children[childIndex]

      if (child == null) {
        continue
      }

      if (!deopt && !child.dynamic && !child.variable) {
        childNode = childNode?.nextSibling

        continue
      }

      deopt = true

      if (child.variable) {
        child = variables[child.value]

        if (!Array.isArray(child)) {
          child = [child]
        }

        for (
          let grandIndex = 0, length = child.length;
          grandIndex < length;
          grandIndex++
        ) {
          let grand = child[grandIndex]

          grand = resolve(grand)

          if (grand == null) grand = ''

          if (grand.type == null) {
            grand = {type: 'text', value: grand}
          }

          if (same && grand.view != null && !grand.dynamic) {
            childNode = childNode?.nextSibling
          } else {
            childNode = morphChild(target, childNode, grand, variables, same)
          }
        }
      } else {
        childNode = morphChild(target, childNode, child, variables, same)
      }
    }
  }

  if (childNode) {
    while (childNode.nextSibling) {
      childNode.nextSibling.remove()
    }

    childNode.remove()
  }

  weakMap.set(target, meta)
}

const morphRoot = (target, next) => {
  const meta = weakMap.get(target) ?? {}

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

export const createDomView = (target, view) => (state) => {
  const current = resolve(view(state))

  morphRoot(target, current)

  if (current.afterUpdate) {
    current.afterUpdate(target)
  }
}

const isSpaceChar = (char) => /\s/.test(char)
const isOfClose = (char) => char === '/' || char === '>' || isSpaceChar(char)
const isOfTag = (char) => !isOfClose(char)
const isOfKey = (char) => char !== '=' && !isOfClose(char)
const isQuoteChar = (char) => char === '"' || char === "'"

const endToken = {
  type: 'end'
}

const tokenizer = {
  *get(acc, strs, vlength) {
    for (let index = 0; index < strs.length; index++) {
      const str = strs[index]

      yield* this.tokenize(acc, str, index > 0)

      if (index < vlength) {
        yield {
          type: 'variable',
          value: index
        }
      }
    }
  },
  *tokenize(acc, str, first) {
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

        while (next() && isOfTag(next())) {
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
        yield* [
          endToken,
          {
            type: 'endtag',
            value: tag
          },
          endToken
        ]

        first = false

        tag = false

        i += 2

        continue
      }

      if (tag && current() === '>') {
        yield endToken

        first = false

        tag = false

        i++

        continue
      }

      if (tag && isOfKey(current())) {
        let value = ''

        i--

        while (next() && isOfKey(next())) {
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

          if (next() && isQuoteChar(next())) {
            i++

            quote = current()

            while (next() !== quote) {
              if (next()) {
                i++

                value += current()
              } else {
                throw Error('Quote mismatch')
              }
            }

            i++

            yield {
              type: 'value',
              value
            }
          } else if (next()) {
            throw Error('Quote expected')
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
      const next = (tokens.next() ?? {value: true}).value

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
        value: token.value
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

const toTemplate = (strs, vlength) => {
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
      children.push({value: token.value})
    }
  }

  if (children.length !== 1) {
    throw Error(`Found ${children.length} root nodes. Expected 1.`)
  } else if (children[0].type !== 'node') {
    throw Error(`Found '${children[0].type}'. Expected 'node'.`)
  }

  children[0].view = view++

  return children[0]
}

export const html = (strs, ...variables) => {
  let result = weakMap.get(strs)

  if (!result) {
    result = toTemplate(strs, variables.length)

    weakMap.set(strs, result)
  }

  return Object.assign({variables}, result)
}

export const createApp = (state) => {
  let viewCalled = false

  return {
    render(view) {
      this.view = view

      viewCalled = false

      return Promise.resolve().then(() => {
        if (!viewCalled) {
          viewCalled = true

          this.view(state)
        }
      })
    },
    commit(arg) {
      if (typeof arg === 'function') {
        state = arg(state) ?? state
      } else {
        state = arg
      }

      viewCalled = true

      if (this.view != null) {
        this.view(state)
      }
    }
  }
}
