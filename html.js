const weakMap = new WeakMap()

const createAssertionError = (actual, expected) =>
  Error(`Expected ${expected}. Found ${actual}.`)

export const tokenTypes = [
  'variable',
  'tag',
  'endtag',
  'key',
  'value',
  'node',
  'text',
  'constant',
  'end'
].reduce((acc, val) => {
  acc[val] = val

  return acc
}, {})

const valueTrue = {
  type: tokenTypes.value,
  value: true
}

const END = {
  type: tokenTypes.end
}

const isSpaceChar = (char) => !char.trim()
const isOfTag = (char) => char !== '/' && char !== '>' && !isSpaceChar(char)
const isOfKey = (char) => char !== '=' && isOfTag(char)
const isQuoteChar = (char) => char === '"' || char === "'"

const tokenizer = {
  *tokenize(acc, strs, vlength) {
    const current = () => str.charAt(i)
    const next = () => str.charAt(i + 1)
    let str, i

    for (let index = 0, length = strs.length; index < length; index++) {
      str = strs[index]
      i = 0

      let tag = acc.tag

      while (current()) {
        if (!tag) {
          let value = ''

          if (current() === '<') {
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
              type: !end ? tokenTypes.tag : tokenTypes.endtag,
              value
            }

            tag = value

            i++
          } else {
            while (current() && current() !== '<') {
              value += current()

              i++
            }

            if (value.trim()) {
              yield {
                type: tokenTypes.text,
                value
              }
            }
          }
        } else if (isSpaceChar(current())) {
          i++
        } else if (current() === '/' && next() === '>') {
          yield END

          yield {
            type: tokenTypes.endtag,
            value: tag
          }

          tag = false

          i += 2
        } else if (current() === '>') {
          yield END

          tag = false

          i++
        } else if (isOfKey(current())) {
          let value = ''

          i--

          while (next() && isOfKey(next())) {
            i++

            value += current()
          }

          yield {
            type: tokenTypes.key,
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
                type: tokenTypes.value,
                value
              }
            } else if (next()) {
              throw createAssertionError(next(), '"')
            }
          } else {
            yield valueTrue
          }

          i++
        }
      }

      acc.tag = tag

      if (index < vlength) {
        yield {
          type: tokenTypes.variable,
          value: index
        }
      }
    }
  }
}

const parse = (read, parent, tag, variables) => {
  const child = {
    tag,
    dynamic: false,
    type: tokenTypes.node,
    attributes: [],
    children: [],
    offsets: {
      attributes: 0,
      children: null
    }
  }

  let token

  while ((token = read())) {
    if (token === END) break

    if (token.type === tokenTypes.key) {
      const key = token.value

      token = read()

      const firstChar = key.charAt(0)
      const special = ':' === firstChar || '@' === firstChar

      let value = token.value
      let constant = false

      if (token.type === tokenTypes.value) {
        constant = true
      } else if (token.type === tokenTypes.variable && !special && !html.dev) {
        value = variables[value]

        constant = true
      }

      if (constant) {
        child.offsets.attributes++

        child.attributes.unshift({
          type: tokenTypes.constant,
          key,
          value
        })
      } else {
        child.dynamic = true

        child.attributes.push({
          type: tokenTypes.variable,
          key,
          value
        })
      }
    } else {
      throw createAssertionError(token.type, END.type)
    }
  }

  while ((token = read())) {
    if (token.type === tokenTypes.endtag && token.value === child.tag) {
      break
    } else if (token.type === tokenTypes.tag) {
      const dynamic = parse(read, child, token.value, variables)

      child.dynamic ||= dynamic
    } else if (token.type === tokenTypes.text) {
      child.children.push({
        type: tokenTypes.text,
        value: token.value
      })
    } else if (token.type === tokenTypes.variable) {
      child.dynamic = true

      child.offsets.children ??= child.children.length

      child.children.push({
        type: tokenTypes.variable,
        value: token.value
      })
    }
  }

  if (child.dynamic) {
    parent.offsets.children ??= parent.children.length
  }

  parent.children.push(child)

  child.offsets.children ??= child.children.length

  return child.dynamic
}

let id = 1

export const html = (strs, ...variables) => {
  let template = weakMap.get(strs)

  if (!template) {
    const acc = {
      tag: false
    }

    const tokens = tokenizer.tokenize(acc, strs, variables.length)
    const read = () => tokens.next().value

    const children = []
    const offsets = {children: null}
    let token

    while ((token = read())) {
      if (token.type === tokenTypes.tag) {
        parse(read, {children, offsets}, token.value, variables)
      } else if (token.type === tokenTypes.text && token.value.trim()) {
        throw createAssertionError(token.type, tokenTypes.node)
      }
    }

    if (children.length !== 1) {
      throw createAssertionError(children.length, 1)
    }

    template = children[0]

    template.view = id++

    weakMap.set(strs, template)
  }

  return {
    view: template.view,
    tag: template.tag,
    dynamic: template.dynamic,
    type: template.type,
    attributes: template.attributes,
    children: template.children,
    offsets: template.offsets,
    variables
  }
}

html.dev = false

export const cache = (result) => {
  if (html.dev) return result

  result.dynamic = false

  return result
}
