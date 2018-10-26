const assert = require('assert')

module.exports = ({ target, store, component, morph, raf }) => {
  raf = raf != null ? raf : window.requestAnimationFrame

  assert.strictEqual(typeof store, 'function', 'store must be a function')

  assert.strictEqual(typeof component, 'function', 'component must be a function')

  assert.strictEqual(typeof morph, 'function', 'morph must be a function')

  assert.strictEqual(typeof raf, 'function', 'raf must be a function')

  let rafCalled = false

  let state

  const dispatch = store(commit)

  assert.strictEqual(typeof dispatch, 'function', 'dispatch must be a function')

  const nextQueue = []

  return (init) => {
    assert.strictEqual(typeof init, 'function', 'init must be a function')

    init(dispatch)
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

    const element = component({ state, dispatch })

    morph(target, element)

    while (nextQueue.length) {
      const callback = nextQueue.shift()

      callback(target)
    }
  }
}
