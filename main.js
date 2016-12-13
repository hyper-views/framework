module.exports = function ({target, store, component, diff, raf}) {
  raf = raf != null ? raf : window.requestAnimationFrame

  let state = store()
  let rafCalled = false

  return function (init) {
    init({target, dispatch})
  }

  function dispatch () {
    state = store(state, ...arguments)

    render()
  }

  function render () {
    if (!rafCalled) {
      rafCalled = true

      raf(() => {
        rafCalled = false

        const element = component({state, dispatch, next})

        if (element != null) {
          diff(target, element)
        }
      })
    }
  }

  function next (callback) {
    process.nextTick(function () {
      callback({target, dispatch})
    })
  }
}
