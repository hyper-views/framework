const assert = require('assert')

module.exports = function ({target, store, component, diff, raf}) {
  raf = raf != null ? raf : window.requestAnimationFrame

  assert.equal(typeof store, 'function', 'store must be a function')
  assert.equal(typeof component, 'function', 'component must be a function')
  assert.equal(typeof diff, 'function', 'diff must be a function')
  assert.equal(typeof raf, 'function', 'raf must be a function')

  let rafCalled = false
  let initialized = false

  let state
  let action = store(function (seed) {
    assert.ok(!initialized, 'trying to seed after the app is initialized')

    if (typeof seed === 'function') {
      state = seed(commit)
    } else {
      state = seed
    }
  })

  return function (init) {
    initialized = true

    if (init != null) {
      assert.equal(typeof init, 'function', 'init must be a function')

      init({target, dispatch})
    } else {
      dispatch()
    }
  }

  function dispatch (...args) {
    if (!args.length) {
      commit((state) => state)
    } else {
      action(commit, ...args)
    }
  }

  function commit (current) {
    assert.ok(initialized, 'trying to commit before the app is initialized')
    assert.equal(typeof current, 'function', 'current must be a function')

    state = current(state)

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
    assert.equal(typeof callback, 'function', 'callback must be a function')

    process.nextTick(callback, {target, dispatch})
  }
}
