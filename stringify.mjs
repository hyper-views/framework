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

export const stringify = ({tag, attributes, children, variables}) => {
  let result = `<${tag}`
  const isSelfClosing = selfClosing.includes(tag)

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

  result += isSelfClosing ? ' />' : '>'

  if (!isSelfClosing) {
    let i = 0

    while (i < children.length) {
      let child = children[i]

      if (child.type === 'variable') {
        child = variables[child.value]
      }

      if (Array.isArray(child)) {
        children.splice(i, 1, ...child)

        child = child[0]
      }

      if (child.type != null) {
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
      } else {
        result += escape(child)
      }

      i++
    }

    result += `</${tag}>`
  }

  return result
}
