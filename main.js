const svgNamespace = 'http://www.w3.org/2000/svg'

const weakMap = new WeakMap()

const createAssertionError = (actual, expected) =>
  Error(`Expected ${expected}. Found ${actual}.`)

const resolve = (obj) => {
  if (typeof obj === 'function') {
    let afterUpdate

    obj = obj((cb) => {
      afterUpdate = async (el) => cb(el)
    })

    if (obj) obj.afterUpdate = afterUpdate
  }

  return obj
}

const readMeta = (target, meta = {}) => {
  if (!meta._read) {
    const read = weakMap.get(target)

    Object.assign(meta, read ?? {})

    meta._read = true
  }

  return meta
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

const morphAttribute = (target, key, value, meta, listeners) => {
  const remove = value == null || value === false

  if (key.indexOf('on') === 0) {
    const type = key.substring(2)

    readMeta(target, meta)

    meta[type] = remove ? null : value

    if (!remove && !listeners.includes(type)) {
      listeners.push(type)

      addListener(target.ownerDocument, type)
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

const morphChild = (
  target,
  childNode,
  next,
  variables,
  isSameView,
  listeners
) => {
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
    const tag = next.tag

    if (
      !append &&
      (childNode.nodeType !== 1 || childNode.nodeName.toLowerCase() !== tag)
    ) {
      replace = true
    }

    if (append || replace) {
      const isSvg = tag === 'svg' || target.namespaceURI === svgNamespace

      currentChild = isSvg
        ? document.createElementNS(svgNamespace, tag)
        : document.createElement(tag)
    }

    if (next.view != null) {
      morphRoot(currentChild, next, listeners)
    } else if (!isSameView || next.dynamic) {
      morph(currentChild, next, variables, isSameView, {}, listeners)
    }
  }

  if (append) {
    target.append(currentChild)
  } else if (replace) {
    childNode.replaceWith(currentChild)
  }

  if (currentChild != null && next.afterUpdate) {
    next.afterUpdate(currentChild)
  }

  return getNextSibling(currentChild)
}

const morph = (target, next, variables, isSameView, meta, listeners) => {
  const attributesLength = next.attributes.length

  const attrNames = []

  if (attributesLength) {
    for (let i = 0, length = attributesLength; i < length; i++) {
      const attribute = next.attributes[i]

      if (!isSameView || attribute.variable) {
        let value = attribute.value

        if (attribute.variable) {
          value = variables[value]
        }

        if (attribute.key) {
          morphAttribute(target, attribute.key, value, meta, listeners)

          attrNames.push(attribute.key)
        } else {
          const keys = Object.keys(value)

          for (let i = 0, len = keys.length; i < len; i++) {
            const key = keys[i]

            morphAttribute(target, key, value[key], meta, listeners)

            attrNames.push(key)
          }
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

  if (childrenLength) {
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

          if (child?.[Symbol.iterator] == null || typeof child === 'string') {
            child = [child]
          }

          for (let grand of child) {
            grand = resolve(grand)

            if (grand == null) grand = ''

            if (grand.type == null) {
              grand = {type: 'text', value: grand}
            }

            if (isSameView && grand.view != null && !grand.dynamic) {
              childNode = getNextSibling(childNode)
            } else {
              childNode = morphChild(
                target,
                childNode,
                grand,
                variables,
                isSameView,
                listeners
              )
            }
          }
        } else {
          childNode = morphChild(
            target,
            childNode,
            child,
            variables,
            isSameView,
            listeners
          )
        }
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

  if (meta._read) {
    weakMap.set(target, meta)
  }
}

const morphRoot = (target, next, listeners) => {
  if (next.view === 0) {
    return
  }

  const meta = readMeta(target)

  const isSameView = next.view === meta.view

  if (!isSameView) {
    meta.view = next.view
  }

  if (!isSameView || next.dynamic) {
    morph(target, next, next.variables, isSameView, meta, listeners)
  }
}

export const createDomView = (target, view) => {
  const listeners = []

  return (state) => {
    const current = resolve(view(state))

    morphRoot(target, current, listeners)

    if (current.afterUpdate) {
      current.afterUpdate(target)
    }
  }
}

const viewZero = {
  type: 'node',
  view: 0,
  dynamic: false
}

export const skipUpdate = () => viewZero

const valueTrue = {
  type: 'value',
  value: true
}

const END = Symbol('end')

const isSpaceChar = (char) => !char.trim()
const isOfTag = (char) => char !== '/' && char !== '>' && !isSpaceChar(char)
const isOfKey = (char) => char !== '=' && isOfTag(char)
const isQuoteChar = (char) => char === '"' || char === "'"

const tokenizer = {
  *get(acc, strs, vlength) {
    for (let index = 0, length = strs.length; index < length; index++) {
      const str = strs[index]

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

          tag = value

          i++
        } else if (tag && isSpaceChar(current())) {
          i++
        } else if (tag && current() === '/' && next() === '>') {
          yield* [
            END,
            {
              type: 'endtag',
              value: tag
            },
            END
          ]

          tag = false

          i += 2
        } else if (tag && current() === '>') {
          yield END

          tag = false

          i++
        } else if (tag && isOfKey(current())) {
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
                  throw createAssertionError('', quote)
                }
              }

              i++

              yield {
                type: 'value',
                value
              }
            } else if (next()) {
              throw createAssertionError(next(), '"')
            }
          } else {
            yield valueTrue
          }

          i++
        } else if (!tag) {
          let value = ''

          while (current() && current() !== '<') {
            value += current()

            i++
          }

          if (value) {
            yield {
              type: 'text',
              value
            }
          }
        }
      }

      acc.tag = tag

      if (index < vlength) {
        yield {
          type: 'variable',
          value: index
        }
      }
    }
  }
}

const parse = (tokens, parent, tag) => {
  const child = {
    tag,
    type: 'node',
    dynamic: false,
    attributes: [],
    children: []
  }

  let current

  for (;;) {
    current = tokens.next()

    if (current.done) break

    const token = current.value

    if (token === END) {
      break
    } else if (token.type === 'key') {
      const next = tokens.next()?.value

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
      const dynamic = parse(tokens, child, token.value)

      child.dynamic = child.dynamic || dynamic
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

  for (;;) {
    const current = tokens.next()

    if (current.done) break

    const token = current.value

    if (token.type === 'tag') {
      parse(tokens, {children}, token.value)
    } else if (token.type === 'text' && token.value.trim()) {
      throw createAssertionError(token.type, "'node'")
    }
  }

  if (children.length !== 1) {
    throw createAssertionError(children.length, 1)
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
  let view

  const callView = () => {
    viewCalled = false

    return Promise.resolve().then(() => {
      if (!viewCalled && view) {
        viewCalled = true

        view(get())

        viewCalled = false
      }
    })
  }

  const proxy = new Proxy(
    {},
    {
      set(_, key, val) {
        if (viewCalled) return false

        state[key] = val

        callView()

        return true
      },
      get(_, key) {
        return state[key]
      }
    }
  )

  const get = () => (typeof state === 'object' ? proxy : state)

  return {
    render(v) {
      view = v

      callView()
    },
    set state(val) {
      if (val !== proxy) {
        state = val
      }

      callView()
    },
    get state() {
      return get()
    }
  }
}
