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

const readMeta = (target, meta = {}) => {
  if (!meta._read) {
    Object.assign(meta, weakMap.get(target) ?? {})

    meta._read = true
  }

  return meta
}

const getNextSibling = (current) => current?.nextSibling

const getListener = (key) => (e) => {
  const map = weakMap.get(e.target)

  if (map && map[key]) {
    map[key](e)
  }
}

const morphAttribute = (target, key, value, meta, listeners) => {
  const document = target.ownerDocument
  const remove = value == null || value === false

  if (key.indexOf('on') === 0) {
    readMeta(target, meta)

    if (remove) {
      if (meta[key]) {
        meta[key] = null
      }
    } else {
      meta[key] = value

      if (!listeners.includes(key)) {
        listeners.push(key)

        const type = key.substring(2)

        document.addEventListener(type, getListener(key))
      }
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
  forceAppend,
  listeners
) => {
  const document = target.ownerDocument

  const append = forceAppend || childNode == null

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
    } else {
      morph(currentChild, next, variables, isSameView, {}, listeners)
    }
  }

  if (forceAppend && childNode) {
    childNode.before(currentChild)
  } else if (append) {
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
  if (isSameView && !next.dynamic) {
    return
  }

  const attributesLength = next.attributes.length

  if (attributesLength) {
    for (let i = 0, length = attributesLength; i < length; i++) {
      const attribute = next.attributes[i]

      if (isSameView && !attribute.variable) {
        continue
      }

      let value = attribute.value

      if (attribute.variable) {
        value = variables[value]
      }

      if (attribute.key) {
        morphAttribute(target, attribute.key, value, meta, listeners)
      } else {
        for (const key of Object.keys(value)) {
          morphAttribute(target, key, value[key], meta, listeners)
        }
      }
    }
  }

  const childrenLength = next.children.length
  let childNode = target.firstChild

  let keys

  let prevKeys

  if (childrenLength) {
    let deopt = !isSameView

    for (let childIndex = 0; childIndex < childrenLength; childIndex++) {
      let child = next.children[childIndex]

      if (child == null) {
        continue
      }

      if (!deopt && !child.dynamic && !child.variable) {
        childNode = getNextSibling(childNode)

        continue
      }

      deopt = true

      if (child.variable) {
        const variableValue = child.value

        child = variables[variableValue]

        if (child?.[Symbol.iterator] == null || typeof child === 'string') {
          child = [child]
        }

        let keyIndex = 0
        let lengthDifference

        for (let grand of child) {
          grand = resolve(grand)

          if (grand == null) grand = ''

          let keysMatch = true

          if (grand.key) {
            if (!keys) {
              keys = {}

              readMeta(target, meta)

              prevKeys = meta.keys?.[variableValue] ?? {}
            }

            if (!keys[variableValue]) {
              keys[variableValue] = []
            }

            keys[variableValue].push(grand.key)

            keysMatch = prevKeys[keyIndex] === grand.key

            grand = grand.value

            lengthDifference = (child.length || 0) - (prevKeys.length || 0)
          }

          keyIndex++

          if (grand.type == null) {
            grand = {type: 'text', value: grand}
          }

          if (!keysMatch && lengthDifference < 0 && childNode != null) {
            lengthDifference++

            const extraNode = childNode

            childNode = childNode.nextSibling

            extraNode.remove()
          }

          if (isSameView && grand.view != null && !grand.dynamic) {
            childNode = getNextSibling(childNode)
          } else {
            const forceAppend = !keysMatch && lengthDifference > 0 && childNode

            if (forceAppend) {
              lengthDifference--

              keyIndex--
            }

            childNode = morphChild(
              target,
              childNode,
              grand,
              variables,
              isSameView,
              forceAppend,
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
          false,
          listeners
        )
      }
    }
  }

  if (keys) {
    meta.keys = keys
  }

  if (childNode) {
    while (childNode.nextSibling) {
      childNode.nextSibling.remove()
    }

    childNode.remove()
  }

  if (meta._read) weakMap.set(target, meta)
}

const morphRoot = (target, next, listeners) => {
  const meta = readMeta(target)

  const isSameView = next.view === 0 || next.view === meta.view

  if (isSameView && next.view != null && !next.dynamic) {
    return
  }

  if (!isSameView) {
    meta.view = next.view
  }

  morph(target, next, next.variables, isSameView, meta, listeners)
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

const isSpaceChar = (char) => /\s/.test(char)
const isOfClose = (char) => char === '/' || char === '>' || isSpaceChar(char)
const isOfTag = (char) => !isOfClose(char)
const isOfKey = (char) => char !== '=' && !isOfClose(char)
const isQuoteChar = (char) => char === '"' || char === "'"

const tokenizer = {
  *get(acc, strs, vlength) {
    for (let index = 0, length = strs.length; index < length; index++) {
      const str = strs[index]
      let first = index > 0

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
            END,
            {
              type: 'endtag',
              value: tag
            },
            END
          ]

          first = false

          tag = false

          i += 2

          continue
        }

        if (tag && current() === '>') {
          yield END

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
            yield valueTrue
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
      const next = tokens.next()?.value ?? true

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
  let view

  const app = {
    render(v) {
      view = v

      viewCalled = false

      return Promise.resolve().then(() => {
        if (!viewCalled) {
          viewCalled = true

          view(state)
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

      if (view != null) {
        view(state)
      }
    }
  }

  return app
}
