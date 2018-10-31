const baseNode = {}

module.exports = new Proxy({}, {
  get (_, tag) {
    return html(tag)
  }
})

function html (tag) {
  return (...args) => {
    let attributes = {}
    let children
    let i = 0

    if (args[0] === false) {
      return null
    }

    if (args[0] === true) {
      i = 1
    }

    if (typeof args[i] === 'object' && !baseNode.isPrototypeOf(args[i])) {
      const keys = Object.keys(args[i])

      for (let j = 0; j < keys.length; j++) {
        const key = keys[j]
        let val = args[i][key]

        if (Array.isArray(val)) {
          val = val.filter((v) => v != null).join(' ')
        } else if (typeof val === 'object') {
          val = Object.keys(val).filter((k) => !!val[k]).join(' ')
        }

        attributes[key] = val
      }

      children = args.slice(i + 1)
    } else {
      children = args.slice(i)
    }

    const result = Object.create(baseNode)

    result.tag = tag

    result.attributes = attributes

    result.children = children.filter((child) => child != null)

    return result
  }
}
