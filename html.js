const assert = require('assert')

const baseNode = {}

module.exports = new Proxy({}, {
  get (_, tag) {
    return html(tag)
  }
})

function html (tag) {
  return (...args) => {
    const attributes = {}
    let children
    let i = 0
    const hooks = {}
    const hooksProxy = new Proxy({}, {
      get (_, key) {
        return (cb) => {
          hooks[key] = cb
        }
      }
    })

    if (args[0] === false) {
      return null
    }

    if (args[0] === true) {
      i = 1
    }

    if (typeof args[i] === 'function') {
      assert.strictEqual(args.length, i + 1, 'too many arguments')

      args = [].concat(args[i](hooksProxy))

      i = 0
    }

    if (typeof args[i] === 'object' && !baseNode.isPrototypeOf(args[i])) {
      const keys = Object.keys(args[i])

      for (let j = 0; j < keys.length; j++) {
        const key = keys[j]

        attributes[key] = args[i][key]
      }

      children = args.slice(i + 1)
    } else {
      children = args.slice(i)
    }

    const result = Object.create(baseNode)

    result.tag = tag

    result.hooks = hooks

    result.attributes = attributes

    result.children = children.filter((child) => child != null)

    return result
  }
}
