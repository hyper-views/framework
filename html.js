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

const tokenize = (acc, strs, vlength) => {
  const tokens = []
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

          tokens.push({
            type: !end ? tokenTypes.tag : tokenTypes.endtag,
            value
          })

          tag = value

          i++
        } else {
          while (current() && current() !== '<') {
            value += current()

            i++
          }

          if (value.trim()) {
            tokens.push({
              type: tokenTypes.text,
              value
            })
          }
        }
      } else if (isSpaceChar(current())) {
        i++
      } else if (current() === '/' && next() === '>') {
        tokens.push(
          END,
          {
            type: tokenTypes.endtag,
            value: tag
          },
          END
        )

        tag = false

        i += 2
      } else if (current() === '>') {
        tokens.push(END)

        tag = false

        i++
      } else if (isOfKey(current())) {
        let value = ''

        i--

        while (next() && isOfKey(next())) {
          i++

          value += current()
        }

        tokens.push({
          type: tokenTypes.key,
          value
        })

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

            tokens.push({
              type: tokenTypes.value,
              value
            })
          } else if (next()) {
            throw createAssertionError(next(), '"')
          }
        } else {
          tokens.push(valueTrue)
        }

        i++
      }
    }

    acc.tag = tag

    if (index < vlength) {
      tokens.push({
        type: tokenTypes.variable,
        value: index
      })
    }
  }

  return tokens
}

const parse = (tokens, parent, tag, variables) => {
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

  for (;;) {
    token = tokens.shift()

    if (!token || token === END) break

    let key = false
    let constant = false
    let value = token.value

    if (token.type === tokenTypes.key) {
      key = token.value
      token = tokens.shift()

      const firstChar = key.charAt(0)
      const special = ':' === firstChar || '@' === firstChar

      constant = token.type === tokenTypes.value
      value = token.value

      if (token.type === tokenTypes.variable && !special && !html.dev) {
        value = variables[value]
        constant = true
      }
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
  }

  for (;;) {
    token = tokens.shift()

    if (!token) break

    if (token.type === tokenTypes.endtag && token.value === child.tag) {
      break
    } else if (token.type === tokenTypes.tag) {
      const dynamic = parse(tokens, child, token.value, variables)

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

let view = 1

const toTemplate = (strs, variables) => {
  const acc = {
    tag: false
  }

  const tokens = tokenize(acc, strs, variables.length)

  const children = []
  const offsets = {children: null}

  for (;;) {
    const token = tokens.shift()

    if (!token) break

    if (token.type === tokenTypes.tag) {
      parse(tokens, {children, offsets}, token.value, variables)
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
  let result = weakMap.get(strs)

  if (!result) {
    result = toTemplate(strs, variables)

    weakMap.set(strs, result)
  }

  return {variables, ...result}
}

export const cache = (result) => {
  if (html.dev) return result

  result.dynamic = false

  return result
}

html.dev = false

export {html}
