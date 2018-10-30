const assert = require('assert')

module.exports = ({ store, component, update, raf }) => {
  raf = raf != null ? raf : window.requestAnimationFrame

  assert.strictEqual(typeof store, 'function', 'store must be a function')

  assert.strictEqual(typeof component, 'function', 'component must be a function')

  assert.strictEqual(typeof update, 'function', 'update must be a function')

  assert.strictEqual(typeof raf, 'function', 'raf must be a function')

  let rafCalled = false

  let state

  const dispatch = store(commit)

  assert.strictEqual(typeof dispatch, 'function', 'dispatch must be a function')

  return dispatch

  function commit (produce) {
    assert.strictEqual(typeof produce, 'function', 'produce must be a function')

    state = produce(state)

    if (!rafCalled) {
      rafCalled = true

      raf(render)
    }
  }

  function render () {
    rafCalled = false

    update(component({ state, dispatch }))
  }
}
