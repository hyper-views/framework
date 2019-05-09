const isNameChar = (char) => char && 'abcdefghijklmnopqrstuvwxyz0123456789-:'.indexOf(char) > -1
const isSpaceChar = (char) => char && ' \t\n\r'.indexOf(char) > -1
const isQuoteChar = (char) => char && '\'"'.indexOf(char) > -1

const tokenize = (str, inTag = false) => {
  const acc = []
  let i = 0

  const current = () => str.charAt(i)
  const next = () => str.charAt(i + 1)

  while (current()) {
    if (!inTag && current() === '<') {
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

      acc.push({
        type: !end ? 'tag' : 'endtag',
        value
      })

      inTag = value

      i++

      continue
    }

    if (inTag && isSpaceChar(current())) {
      i++

      continue
    }

    if (inTag && current() === '/' && next() === '>') {
      acc.push({
        type: 'end',
        value: inTag
      }, {
        type: 'endtag',
        value: inTag
      }, {
        type: 'end',
        value: inTag
      })

      inTag = false

      i += 2

      continue
    }

    if (inTag && current() === '>') {
      acc.push({
        type: 'end',
        value: ''
      })

      inTag = false

      i++

      continue
    }

    if (inTag && isNameChar(current())) {
      let value = ''

      i--

      while (next() && isNameChar(next())) {
        i++

        value += current()
      }

      acc.push({
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

          acc.push({
            type: 'value',
            value
          })
        } else if (next()) {
          while (next() && !isSpaceChar(next())) {
            i++

            value += current()
          }

          i++

          acc.push({
            type: 'value',
            value
          })
        }
      }

      i++

      continue
    }

    if (!inTag) {
      let value = ''

      while (current() && current() !== '<') {
        value += current()

        i++
      }

      if (value.trim()) {
        acc.push({
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

const parse = (tokens, child) => {
  while (tokens.length) {
    const token = tokens.shift()

    if (token.type === 'end') {
      break
    } else if (token.type === 'key') {
      if (tokens[0] && ['value', 'variable'].includes(tokens[0].type)) {
        child.attributes[token.value] = tokens.shift().value
      } else {
        child.attributes[token.value] = true
      }
    } else if (token.type === 'variable') {
      for (const key of Object.keys(token.value)) {
        child.attributes[key] = token.value[key]
      }
    }
  }

  while (tokens.length) {
    const token = tokens.shift()

    if (token.type === 'endtag' && token.value === child.tag) {
      break
    } else if (token.type === 'tag') {
      const grand = {
        tag: token.value,
        attributes: {},
        children: []
      }

      child.children.push(parse(tokens, grand))
    } else if (token.type === 'text') {
      child.children.push(token.value)
    } else if (token.type === 'variable') {
      if (Array.isArray(token.value)) {
        child.children.push(...token.value)
      } else {
        child.children.push(token.value)
      }
    }
  }

  return child
}

export default (strs, ...vars) => {
  const tokens = strs.reduce((acc, str, i) => {
    let inTag = false

    if (acc.length - 2 > -1) {
      const prev = acc[acc.length - 2]

      if (['tag', 'key', 'value'].includes(prev.type)) {
        inTag = acc.filter((val) => val.type === 'tag')[0]
      }
    }

    acc.push(...tokenize(str, inTag))

    if (i < vars.length) {
      acc.push({
        type: 'variable',
        value: vars[i]
      })
    }

    return acc
  }, [])

  const children = []

  while (tokens.length) {
    const token = tokens.shift()

    if (token.type === 'tag') {
      const child = {
        tag: token.value,
        attributes: {},
        children: []
      }

      children.push(parse(tokens, child))
    } else if (token.type === 'text') {
      children.push(token.value)
    }
  }

  return children[0]
}

export const safe = (html) => {
  return {html}
}
