const weakMap = new WeakMap()

const createAssertionError = (actual, expected) =>
  Error(`Expected ${expected}. Found ${actual}.`)

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
