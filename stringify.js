import {escape} from './escape.js'
import {tokenTypes} from './html.js'

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

export const stringify = (obj) => {
  const {tag, attributes, children, variables} = obj

  let result = `<${tag}`
  const isSelfClosing = selfClosing.includes(tag)

  const reducedAttributes = Array.from({
    *[Symbol.iterator]() {
      for (const attribute of attributes) {
        if (attribute.key) {
          if (attribute.key.startsWith('@')) continue

          const hasColon = attribute.key.startsWith(':')

          if (hasColon) {
            attribute.key = attribute.key.substring(1)
          }

          yield attribute
        } else {
          for (let key of Object.keys(variables[attribute.value])) {
            if (key.startsWith('@')) continue

            const hasColon = key.startsWith(':')

            if (hasColon) {
              key = key.substring(1)
            }

            yield {key, value: variables[attribute.value][key]}
          }
        }
      }
    }
  })

  for (const attr of reducedAttributes) {
    let value = attr.value

    if (attr.type === tokenTypes.variable) {
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

      if (child?.type === tokenTypes.variable) {
        child = variables[child.value]
      }

      if (child?.[Symbol.iterator] == null || typeof child === 'string') {
        child = [child]
      }

      for (let c of child) {
        c = c ?? ''

        descendants.push(c)
      }
    }

    while (i < descendants.length) {
      const child = descendants[i]

      if (child != null) {
        if (child.type != null) {
          switch (child.type) {
            case tokenTypes.text:
              result += tag !== 'style' ? escape(child.value) : child.value
              break

            case tokenTypes.node:
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
