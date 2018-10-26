const defaultDom = {
  tag: '',
  attributes: {},
  events: {},
  children: []
}

module.exports = () => {
  let previous

  return (target, next) => {
    let result = morph(target, next, previous)

    previous = next

    return result
  }

  function morph (target, next, previous = defaultDom) {
    const usedAttributes = []

    for (const key of Object.keys(next.attributes)) {
      usedAttributes.push(key)

      const val = next.attributes[key]

      if (val !== previous.attributes[key]) {
        target.setAttribute(key, val)
      }
    }

    for (const key of Object.keys(previous.attributes).filter((key) => usedAttributes.includes(key))) {
      target.removeAttribute(key)
    }

    const usedEvents = []

    for (const key of Object.keys(next.events)) {
      usedEvents.push(key)

      const val = next.events[key]

      if (val !== previous.events[key]) {
        target[key] = val
      }
    }

    for (const key of Object.keys(previous.events).filter((key) => usedEvents.includes(key))) {
      delete target[key]
    }

    return target
  }
}
