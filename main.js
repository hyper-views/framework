module.exports = function ({target, store, component, diff, options, raf}) {
  raf = raf != null ? raf : window.requestAnimationFrame

  if (options != null) {
    options.dispatch = dispatch
    options.next = next
  } else {
    options = {dispatch, next}
  }

  let stores = !Array.isArray(store) ? [store] : store
  let state = stores.reduce((state, store) => store(state))
  let rafCalled = false

  return function (init) {
    init({target, dispatch})
  }

  function dispatch () {
    state = stores.reduce((state, store) => store(state, ...arguments), state)

    if (!rafCalled) {
      rafCalled = true

      raf(render)
    }
  }

  function render () {
    rafCalled = false

    let app = {state}

    Object.keys(options).forEach(function (prop) {
      app[prop] = options[prop]
    })

    const element = component(app)

    if (element != null) {
      diff(target, element)
    }
  }

  function next (callback) {
    process.nextTick(callback, {target, dispatch})
  }
}
