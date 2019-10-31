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
      if (tokens[0] && tokens[0].type === 'value') {
        child.attributes.push({key: token.value, value: tokens.shift().value})
      } else if (tokens[0] && tokens[0].type === 'variable') {
        const value = tokens.shift().value

        child.dynamic = true

        child.attributes.push({
          key: token.value,
          variable: true,
          value
        })
      } else {
        child.attributes.push({key: token.value, value: true})
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

  return children[0]
}

export const view = (cache = {}) => new Proxy({}, {
  get(_, view) {
    return (strs, ...variables) => {
      if (!cache[view]) {
        cache[view] = create(strs, variables.length)
      }

      return {...cache[view], view, variables}
    }
  }
})

export const safe = (html) => {
  return {type: 'html', html}
}
