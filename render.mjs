const escape = (str) => String(str).replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/'/g, '&quot;')
  .replace(/'/g, '&#039;')

const selfClosing = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]

const stringify = ({tag, attributes, children, variables}) => {
  let result = `<${tag}`

  for (const attr of attributes.filter(({key}) => !key.startsWith('on'))) {
    let value = attr.value

    if (attr.variable) {
      value = variables[value]
    }

    if (value === true) {
      result += ` ${attr.key}`
    } else if (value !== false) {
      result += ` ${attr.key}="${escape(value)}"`
    }
  }

  result += selfClosing.includes(tag) ? ' />' : '>'

  if (!selfClosing.includes(tag)) {
    let i = 0

    while (i < children.length) {
      let child = children[i]

      if (child.type === 'variable') {
        child = variables[child.value]
      }

      switch (child.type) {
        case 'html':
          result += child.html
          break

        case 'text':
          result += escape(child.text)
          break

        case 'node':
          result += stringify({...child, variables: child.view ? child.variables : variables})
          break
      }

      i++
    }

    result += `</${tag}>`
  }

  return result
}

export default stringify
