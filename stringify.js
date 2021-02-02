const escape = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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

const noop = () => {}

const resolve = (obj) => {
  if (typeof obj === 'function') {
    obj = obj(noop)
  }

  return obj
}

export const stringify = (obj) => {
  const {tag, attributes, children, variables} = resolve(obj)

  let result = `<${tag}`
  const isSelfClosing = selfClosing.includes(tag)

  const reducedAttributes = Array.from({
    *[Symbol.iterator]() {
      for (const attribute of attributes) {
        if (attribute.key) {
          if (attribute.key.startsWith('on')) continue

          yield attribute
        } else {
          for (const [key, value] of Object.entries(
            variables[attribute.value]
          )) {
            if (key.startsWith('on')) continue

            yield {key, value}
          }
        }
      }
    }
  })

  for (const attr of reducedAttributes) {
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

  result += '>'

  if (!isSelfClosing) {
    let i = 0

    const descendants = []

    for (let i = 0; i < children.length; i++) {
      let child = children[i]

      if (child?.type === 'variable') {
        child = variables[child.value]
      }

      if (child?.[Symbol.iterator] == null || typeof child === 'string') {
        child = [child]
      }

      for (let c of child) {
        c = resolve(c) ?? ''

        descendants.push(c.key != null ? c.value : c)
      }
    }

    while (i < descendants.length) {
      const child = descendants[i]

      if (child != null) {
        if (child.type != null) {
          switch (child.type) {
            case 'text':
              result += tag !== 'style' ? escape(child.value) : child.value
              break

            case 'node':
              result += stringify(
                Object.assign({}, child, {
                  variables: child.view != null ? child.variables : variables
                })
              )
              break
          }
        } else {
          result += tag !== 'style' ? escape(child) : child
        }
      }

      i++
    }

    result += `</${tag}>`
  }

  return result
}
