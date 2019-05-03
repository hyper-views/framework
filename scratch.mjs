const nameChars = 'abcdefghijklmnopqrstuvwxyz0123456789-:'
const spaceChars = ' \t\n\r'
const quoteChars = '\'"'

const tokenize = (str, inTag = false) => {
  const acc = []
  let i = 0

  const current = () => str.charAt(i)
  const next = () => str.charAt(i + 1)

  while (current()) {
    if (!inTag && current() === '<') {
      inTag = true

      let value = ''
      let end = false

      if (next() === '/') {
        end = true

        i++
      }

      while (next() && nameChars.includes(next())) {
        i++

        value += current()
      }

      acc.push({
        type: !end ? 'tag' : 'endtag',
        value
      })

      i++

      continue
    }

    if (inTag && current() && spaceChars.includes(current())) {
      i++

      continue
    }

    if (inTag && current() === '/' && next() === '>') {
      acc.push({
        type: 'endtag',
        value: ''
      })

      inTag = false

      i++

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

    if (inTag && current() && nameChars.includes(current())) {
      let value = ''

      i--

      while (next() && nameChars.includes(next())) {
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

        if (next() && quoteChars.includes(next())) {
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
        }
      }

      i++

      continue
    }

    if (!inTag) {
      let value = ''

      if (current() !== '>') {
        i--
      }

      while (next() && next() !== '<') {
        i++

        value += current()
      }

      if (value) {
        acc.push({
          type: 'text',
          value
        })
      }
    }

    i++
  }

  return acc
}

const html = (strs, ...vars) => strs.reduce((acc, str, i) => {
  const inTag = acc.length - 2 > -1 ? ['tag', 'key', 'value'].includes(acc[acc.length - 2].type) : false

  acc.push(...tokenize(str, inTag))

  if (i < vars.length) {
    acc.push({
      type: 'variable',
      value: vars[i]
    })
  }

  return acc
}, [])

console.log(html`<div attr1 attr2=${2} attr3="3" ${{attr4: 4}}><p>${'text'} more text<img src="" /></p></div>`)
