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

const parse = (tokens, child, path, emit) => {
  while (tokens.length) {
    const token = tokens.shift()

    if (token.type === 'end') {
      break
    } else if (token.type === 'key') {
      if (tokens[0] && tokens[0].type === 'value') {
        child.attributes[token.value] = tokens.shift().value
      } else if (tokens[0] && tokens[0].type === 'variable') {
        emit([...path, 'attributes', token.value])

        tokens.shift()
      } else {
        child.attributes[token.value] = true
      }
    } else if (token.type === 'variable') {
      emit([...path, 'attributes'])
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

      child.children.push(parse(tokens, grand, [...path, 'children', child.children.length], emit))
    } else if (token.type === 'text') {
      child.children.push(token.value)
    } else if (token.type === 'variable') {
      emit([...path, 'children', child.children.length])

      child.children.push(null)
    }
  }

  return child
}

const cache = {}

export default (key) => {
  const saturate = (vars) => {
    const copy = JSON.parse(cache[key])
    let i = -1

    while (++i < vars.length) {
      const variable = vars[i]
      const path = copy.paths[i]
      let assign = path.length - 1 >= 0 && path[path.length - 1] === 'attributes'
      let set = path.length - 2 >= 0 && path[path.length - 2] === 'attributes'
      let current = copy.children
      let key

      while(path.length) {
        key = path.shift()

        if(path.length) {
          current = current[key]
        }
      }

      if (set) {
        current[key] = variable
      } else if (assign) {
        for (const attr of Object.keys(variable)) {
          current[key][attr] = variable[attr]
        }
      } else {
        current.splice(key, 1, variable)
      }
    }

    return copy.children[0]
  }

  const build = (strs, vars) => {
    const paths = []

    const emit = (path) => {
      paths.push(path)
    }

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
          type: 'variable'
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

        children.push(parse(tokens, child, [children.length], emit))
      } else if (token.type === 'text') {
        children.push(token.value)
      }
    }

    if (children.length !== 1) {
      throw Error('one root element expected')
    }

    cache[key] = JSON.stringify({
      children,
      paths
    })

    return saturate(vars)
  }

  return (strs, ...vars) => {
    if (cache[key]) {
      return saturate(vars)
    }

    return build(strs, vars)
  }
}

export const safe = (html) => {
  return {html}
}
