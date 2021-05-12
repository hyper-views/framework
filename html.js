const weakMap = new WeakMap()

const createAssertionError = (actual, expected) =>
  Error(`Expected ${expected}. Found ${actual}.`)

export const tokenTypes = {
  variable: 0,
  tag: 1,
  endtag: 2,
  key: 3,
  value: 4,
  node: 5,
  text: 6,
  constant: 7
}

const valueTrue = {
  type: tokenTypes.value,
  value: true
}

const END = Symbol('end')

const isSpaceChar = (char) => !char.trim()
const isOfTag = (char) => char !== '/' && char !== '>' && !isSpaceChar(char)
const isOfKey = (char) => char !== '=' && isOfTag(char)
const isQuoteChar = (char) => char === '"' || char === "'"

const tokenizer = {
  *get(acc, strs, vlength) {
    let afterVar = false

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

          afterVar = false

          yield {
            type: !end ? tokenTypes.tag : tokenTypes.endtag,
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
              type: tokenTypes.endtag,
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
        } else if (!tag) {
          let value = ''

          while (current() && current() !== '<') {
            value += current()

            i++
          }

          if (value.trim() || (afterVar && current() !== '<')) {
            yield {
              type: tokenTypes.text,
              value
            }
          }
        }
      }

      acc.tag = tag

      if (index < vlength) {
        afterVar = true

        yield {
          type: tokenTypes.variable,
          value: index
        }
      }
    }
  }
}

const parse = (nextToken, parent, tag, variables) => {
  const child = {
    tag,
    dynamic: false,
    type: tokenTypes.node,
    attributes: [],
    children: []
  }

  let token

  for (;;) {
    token = nextToken()

    if (token == null || token === END) break

    let key = false
    let constant = false
    let value = token.value

    if (token.type === tokenTypes.key) {
      key = token.value
      token = nextToken()

      const firstChar = key.charAt(0)
      const colon = ':' === firstChar
      const atSign = '@' === firstChar

      if (colon) {
        key = key.substring(1)
      }

      constant = token.type === tokenTypes.value
      value = token.value

      if (token.type === tokenTypes.variable && !colon && !atSign) {
        value = variables[value]
        constant = true
      }
    }

    if (constant) {
      if (child.attributes.offset != null) child.attributes.offset++

      child.attributes.unshift({
        type: tokenTypes.constant,
        key,
        value
      })
    } else {
      child.dynamic = true

      child.attributes.offset =
        child.attributes.offset ?? child.attributes.length

      child.attributes.push({
        type: tokenTypes.variable,
        key,
        value
      })
    }
  }

  for (;;) {
    token = nextToken()

    if (token == null) break

    if (token.type === tokenTypes.endtag && token.value === child.tag) {
      break
    } else if (token.type === tokenTypes.tag) {
      const dynamic = parse(nextToken, child, token.value, variables)

      child.dynamic = child.dynamic || dynamic
    } else if (token.type === tokenTypes.text) {
      child.children.push({
        type: tokenTypes.text,
        value: token.value
      })
    } else if (token.type === tokenTypes.variable) {
      child.dynamic = true

      child.children.offset = child.children.offset ?? child.children.length

      child.children.push({
        type: tokenTypes.variable,
        value: token.value
      })
    }
  }

  if (child.dynamic) {
    parent.children.offset = parent.children.offset ?? parent.children.length
  }

  parent.children.push(child)

  return child.dynamic
}

let view = 1

const toTemplate = (strs, variables) => {
  const acc = {
    tag: false
  }

  const tokens = tokenizer.get(acc, strs, variables.length)

  const nextToken = () => {
    const token = tokens.next()

    if (token.done) return

    return token.value
  }

  const children = []

  for (;;) {
    const token = nextToken()

    if (token == null) break

    if (token.type === tokenTypes.tag) {
      parse(nextToken, {children}, token.value, variables)
    } else if (token.type === tokenTypes.text && token.value.trim()) {
      throw createAssertionError(token.type, "'node'")
    }
  }

  if (children.length !== 1) {
    throw createAssertionError(children.length, 1)
  }

  children[0].view = view++

  return children[0]
}

const html = (strs, ...variables) => {
  let result = html.cache?.get(strs)

  if (!result) {
    result = toTemplate(strs, variables)

    html.cache?.set(strs, result)
  }

  return Object.assign({variables}, result)
}

html.cache = weakMap

export {html}
