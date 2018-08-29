const assert = require('assert')

module.exports = function ({ target, store, component, diff, raf }) {
  raf = raf != null ? raf : window.requestAnimationFrame

  assert.strictEqual(typeof store, 'function', 'store must be a function')

  assert.strictEqual(typeof component, 'function', 'component must be a function')

  assert.strictEqual(typeof diff, 'function', 'diff must be a function')

  assert.strictEqual(typeof raf, 'function', 'raf must be a function')

  let rafCalled = false

  let state

  const actions = store(commit)

  assert.strictEqual(typeof actions, 'object', 'actions must be an object')

  const nextQueue = []

  return function (init) {
    assert.strictEqual(typeof init, 'function', 'init must be a function')

    init(dispatch)
  }

  function dispatch (action, ...args) {
    if (action == null) {
      commit((state) => state)
    } else {
      assert.ok(actions[action], 'action not defined')

      return actions[action](...args)
    }
  }

  function commit (current) {
    assert.strictEqual(typeof current, 'function', 'current must be a function')

    state = current(state)

    if (!rafCalled) {
      rafCalled = true

      raf(render)
    }
  }

  function render () {
    rafCalled = false

    const element = component({ state, dispatch, next })

    diff(target, element)

    while (nextQueue.length) {
      let callback = nextQueue.shift()

      callback(target)
    }
  }

  function next (callback) {
    assert.strictEqual(typeof callback, 'function', 'callback must be a function')

    nextQueue.push(callback)
  }
}
