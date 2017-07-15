module.exports = function ({target, store, component, diff, raf}) {
  raf = raf != null ? raf : window.requestAnimationFrame

  let state
  let rafCalled = false
  let action

  action = store(function (seed) {
    if (!action) {
      state = seed
    }
  })

  return function (init) {
    if (typeof init === 'function') {
      init({target, dispatch})
    } else {
      dispatch()
    }
  }

  function dispatch (...args) {
    if (!args.length) {
      commit(function () {
        return state
      })
    } else {
      action(commit, ...args)
    }
  }

  function commit (then) {
    state = then(state)

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
