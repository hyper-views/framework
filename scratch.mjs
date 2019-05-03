const tokenize = (str) => {
  const tokens = []

  for (const token of str.split(/(\s|\n)+/).filter((token) => token.trim())) {
    const offset = token.endsWith('/>') ? 2 : token.endsWith('>') ? 1 : 0

    switch (true) {
      case token.startsWith('</'):
      tokens.push({
        type: 'lt_slash',
        value: token.substring(2, token.length - offset)
      })
      break

      case token.startsWith('<'):
      tokens.push({
        type: 'lt',
        value: token.substring(1, token.length - offset)
      })
      break

      case token.endsWith('='):
      tokens.push({
        type: 'key_equals',
        value: token.substring(0, token.length - 1)
      })
      break

      case !offset:
      tokens.push({
        type: 'key',
        value: token
      })
      break
    }

    switch (offset) {
      case 2:
      tokens.push({
        type: 'slash_gt'
      })
      break

      case 1:
      tokens.push({
        type: 'gt'
      })
      break
    }
  }

  return tokens
}

const html = (strs, ...vars) => {
  return strs.reduce((acc, str, i) => {
    acc.push(...tokenize(str))

    if (i < vars.length) {
      acc.push({
        type: 'variable',
        value: vars[i]
      })
    }

    return acc
  }, [])
}


console.log(html`<tag>${'text'}</tag>`)

console.log('.................................')

console.log(html`<tag>
<sub>${1}</sub>
</tag>`)

console.log('.................................')

console.log(html`<tag attr=${'val'}>${'text'}</tag>`)

console.log('.................................')

console.log(html`<tag bool attr=${123} />`)

console.log('.................................')

console.log(html`<tag ${{attr: 123}} />`)
