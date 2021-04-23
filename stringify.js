import {tokenTypes} from './html.js'

const escapeObj = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}
const escapeValuesArr = Object.values(escapeObj)
const escapeKeysStr = Object.keys(escapeObj).join('')
const escapeRegex = new RegExp(escapeKeysStr, 'g')

const escape = (str) => {
  try {
    return str.replaceAll(
      escapeRegex,
      (match) => escapeValuesArr[escapeKeysStr.indexOf(match)]
    )
  } catch {
    return str
  }
}

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
