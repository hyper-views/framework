module.exports = function ({target, store, component, diff, options, raf}) {
  raf = raf != null ? raf : window.requestAnimationFrame

  options = options != null ? Object.assign({}, options, {dispatch, next}) : {dispatch, next}
  let stores = store

  if (!Array.isArray(store)) {
    stores = [store]
  }

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

    const element = component(Object.assign({state}, options))

    if (element != null) {
      diff(target, element)
    }
  }

  function next (callback) {
    process.nextTick(callback, {target, dispatch})
  }
}
