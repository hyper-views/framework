const svgNamespace = 'http://www.w3.org/2000/svg'

const xlinkNamespace = 'http://www.w3.org/1999/xlink'

const metaMap = new WeakMap()

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
          const event = (metaMap.get(target) || {})[key]

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
      const childNode = target.childNodes[index + offset]

      const node = div.childNodes[0]

      if (childNode == null) {
        target.append(node)
      } else if (!childNode.isEqualNode(node)) {
        childNode.replaceWith(node)
      } else {
        node.remove()
      }
    }

    return length
  }

  const childNode = target.childNodes[index]

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

      newChild = namespace !== 'http://www.w3.org/1999/xhtml' ? document.createElementNS(namespace, tag) : document.createElement(tag)
    }

    t = newChild || childNode

    if (next.view != null) {
      morphRoot(t, next)
    } else {
      const meta = metaMap.get(t) || {}

      morph(t, next, variables, same, meta)

      metaMap.set(t, meta)
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
        child = resolve(variables[child.value])

        if (child != null && child.type == null && !Array.isArray(child)) {
          child = {type: 'text', text: child}
        }
      }

      if (Array.isArray(child)) {
        for (let grandIndex = 0, length = child.length; grandIndex < length; grandIndex++) {
          const grand = resolve(child[grandIndex])

          result += morphChild(target, result, grand, variables, same)
        }
      } else {
        result += morphChild(target, result, child, variables, same)
      }
    }

    childrenLength = result
  }

  while (target.childNodes.length > childrenLength) {
    target.childNodes[childrenLength].remove()
  }
}

const morphRoot = (target, next) => {
  const meta = metaMap.get(target) || {}
  const same = next.view === 0 || next.view === meta.view

  if (same && next.view != null && !next.dynamic) {
    return
  }

  if (!same) {
    meta.view = next.view
  }

  morph(target, next, next.variables, same, meta)

  metaMap.set(target, meta)
}

export const domUpdate = (target) => (current) => {
  setTimeout(() => {
    current = resolve(current)

    morphRoot(target, current)

    if (current.afterUpdate) {
      current.afterUpdate(target)
    }
  }, 0)
}

export const raw = (html) => {
  return {type: 'html', html}
}

const isNameChar = (char) => char && 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-:'.indexOf(char) > -1
const isSpaceChar = (char) => char && ' \t\n\r'.indexOf(char) > -1
const isQuoteChar = (char) => char && '\'"'.indexOf(char) > -1

const tokenize = (acc, str) => {
  let i = 0

  const current = () => str.charAt(i)
  const next = () => str.charAt(i + 1)

  while (current()) {
    if (!acc.tag && current() === '<') {
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

      acc.tokens.push({
        type: !end ? 'tag' : 'endtag',
        value
      })

      acc.tag = value

      i++

      continue
    }

    if (acc.tag && isSpaceChar(current())) {
      i++

      continue
    }

    if (acc.tag && current() === '/' && next() === '>') {
      acc.tokens.push({
        type: 'end',
        value: acc.tag
      }, {
        type: 'endtag',
        value: acc.tag
      }, {
        type: 'end',
        value: acc.tag
      })

      acc.tag = false

      i += 2

      continue
    }

    if (acc.tag && current() === '>') {
      acc.tokens.push({
        type: 'end',
        value: ''
      })

      acc.tag = false

      i++

      continue
    }

    if (acc.tag && isNameChar(current())) {
      let value = ''

      i--

      while (next() && isNameChar(next())) {
        i++

        value += current()
      }

      acc.tokens.push({
        type: 'key',
        value
      })

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

          acc.tokens.push({
            type: 'value',
            value
          })
        } else if (next()) {
          while (next() && !isSpaceChar(next()) && next() !== '>') {
            i++

            value += current()
          }

          if (next() !== '>') i++

          acc.tokens.push({
            type: 'value',
            value
          })
        }
      } else {
        acc.tokens.push({
          type: 'value',
          value: true
        })
      }

      i++

      continue
    }

    if (!acc.tag) {
      let value = ''

      while (current() && current() !== '<') {
        value += current()

        i++
      }

      const previous = acc.tokens[acc.tokens.length - 1]

      let trim = true

      if (!current() && (previous && previous.type === 'variable')) {
        trim = false
      }

      if ((!trim && value) || (trim && value.trim())) {
        acc.tokens.push({
          type: 'text',
          value
        })
      }

      continue
    }

    i++
  }

  return acc
}

const parse = (tokens, parent, tag) => {
  const child = {
    type: 'node',
    tag,
    dynamic: false,
    attributes: [],
    children: []
  }

  while (tokens.length) {
    const token = tokens.shift()

    if (token.type === 'end') {
      break
    } else if (token.type === 'key') {
      if (tokens[0].type === 'value') {
        child.attributes.push({key: token.value, value: tokens.shift().value})
      } else {
        const value = tokens.shift().value

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

  while (tokens.length) {
    const token = tokens.shift()

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
  const {tokens} = strs.reduce((acc, str, index) => {
    tokenize(acc, str)

    if (index < vlength) {
      acc.tokens.push({
        type: 'variable',
        value: index
      })
    }

    return acc
  }, {
    tokens: [],
    tag: false
  })

  const children = []

  while (tokens.length) {
    const token = tokens.shift()

    if (token.type === 'tag') {
      parse(tokens, {children}, token.value)
    } else if (token.type === 'text') {
      children.push({text: token.value})
    }
  }

  if (children.length !== 1) {
    throw Error('one root element expected')
  }

  return {view: view++, root: children[0]}
}

const templateCache = new WeakMap()

export const html = (strs, ...variables) => {
  let result

  if (!templateCache.has(strs)) {
    result = create(strs, variables.length)

    templateCache.set(strs, result)
  } else {
    result = templateCache.get(strs)
  }

  return {...result.root, view: result.view, variables}
}

export const render = ({state, component, update}) => {
  const commit = (produce) => {
    state = produce(state)

    update(component({state, commit}))
  }

  commit((state) => state)

  return commit
}
