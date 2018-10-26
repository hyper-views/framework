module.exports = new Proxy({}, {
  get (target, prop, receiver) {
    return vdom(prop)
  }
})

function vdom (tag) {
  return (...args) => {
    let attributes = {}
    let events = {}
    let children
    let i = 0

    if (args[0] === false) {
      return ''
    }

    if (args[0] === true) {
      i = 1
    }

    if (typeof args[i] === 'object') {
      for (const key of Object.keys(args[i])) {
        const val = args[i][key]

        if (key.startsWith('on')) {
          events[key] = val
        } else {
          attributes[key] = val
        }
      }

      children = args.slice(i + 1)
    } else {
      children = args.slice(i)
    }

    return {
      tag,
      attributes,
      events,
      children
    }
  }
}
