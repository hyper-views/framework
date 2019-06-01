const isNameChar = (char) => char && 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-:'.indexOf(char) > -1
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
          while (next() && !isSpaceChar(next()) && next() !== '>') {
            i++

            value += current()
          }

          if (next() !== '>') i++

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
      if (tokens[0] && tokens[0].type === 'value') {
        child.attributes.push({key: token.value, value: tokens.shift().value})
      } else if (tokens[0] && tokens[0].type === 'variable') {
        const value = tokens.shift().value

        if (token.value === 'id') {
          child.id = value
        }

        child.attributes.push({
          key: token.value,
          variable: true,
          value
        })
      } else {
        child.attributes.push({key: token.value, value: true})
      }
    } else if (token.type === 'variable') {
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
      const grand = {
        id: null,
        tag: token.value,
        attributes: [],
        children: []
      }

      child.children.push(parse(tokens, grand))
    } else if (token.type === 'text') {
      child.children.push({
        text: token.value
      })
    } else if (token.type === 'variable') {
      child.children.push({
        variable: true,
        value: token.value
      })
    }
  }

  return child
}

const cache = {}

const create = (strs, vlength) => {
  const tokens = strs.reduce((acc, str, index) => {
    let inTag = false

    if (acc.length - 2 > -1 && acc[acc.length - 1].type !== 'end') {
      const prev = acc[acc.length - 2]

      if (['tag', 'key', 'value'].includes(prev.type)) {
        const filtered = acc.filter((val) => val.type === 'tag')
        inTag = filtered[filtered.length - 1].value
      }
    }

    acc.push(...tokenize(str, inTag))

    if (index < vlength) {
      acc.push({
        type: 'variable',
        value: index
      })
    }

    return acc
  }, [])

  const children = []

  while (tokens.length) {
    const token = tokens.shift()

    if (token.type === 'tag') {
      const child = {
        id: null,
        tag: token.value,
        attributes: [],
        children: []
      }

      children.push(parse(tokens, child))
    } else if (token.type === 'text') {
      children.push({text: token.value})
    }
  }

  if (children.length !== 1) {
    throw Error('one root element expected')
  }

  return children[0]
}

export default new Proxy({}, {
  get(_, key) {
    return (strs, ...variables) => {
      if (!cache[key]) {
        cache[key] = create(strs, variables.length)
      }

      const tree = cache[key]

      return {tree, variables}
    }
  }
})

export const safe = (html) => {
  return {html}
}
