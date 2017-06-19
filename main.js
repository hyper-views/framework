module.exports = function ({target, store, component, diff, raf}) {
  raf = raf != null ? raf : window.requestAnimationFrame

  let state = store()
  let rafCalled = false

  return function (init) {
    init({target, dispatch})
  }

  function dispatch () {
    const args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments))

    args.unshift(state)

    state = store.apply(null, args)

    if (!rafCalled) {
      rafCalled = true

      raf(render)
    }
  }

  function render () {
    rafCalled = false

    const element = component({state, dispatch, next})

    if (element != null) {
      diff(target, element)
    }
  }

  function next (callback) {
    process.nextTick(callback, {target, dispatch})
  }
}
