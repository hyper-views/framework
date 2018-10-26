const test = require('tape')
const noop = () => {}
const raf = (callback) => {
  process.nextTick(() => { callback() })
}
const initialElement = Symbol('initial target')
const newElement = Symbol('new target')
const initialState = Symbol('initial state')
const newState = Symbol('new state')
const dispatchArgument = Symbol('dispatch argument')

test('init to render', (t) => {
  t.plan(10)

  require('./main.js')({
    target: initialElement,
    store (commit) {
      t.equal(commit.name, 'commit')

      t.equal(typeof commit, 'function')

      commit(() => initialState)

      return (arg) => {
        t.equal(arg, dispatchArgument)

        commit((state) => {
          t.equal(state, initialState)

          return newState
        })
      }
    },
    component (app) {
      t.deepEqual(Object.keys(app).length, 2)

      t.equal(typeof app.dispatch, 'function')

      t.equal(app.state, newState)

      return newElement
    },
    morph (target, newElement) {
      t.equal(target, initialElement)

      t.deepEqual(newElement, newElement)
    },
    raf
  })((dispatch) => {
    t.equal(typeof dispatch, 'function')

    dispatch(dispatchArgument)
  })
})

test('using dispatch', (t) => {
  t.plan(2)

  require('./main.js')({
    target: initialElement,
    store (commit) {
      commit(() => initialState)

      return (arg) => {
        t.equal(arg, dispatchArgument)

        commit((state) => {
          t.equal(state, initialState)

          return newState
        })
      }
    },
    component ({ dispatch, state }) {
      if (state === initialState) {
        process.nextTick(() => {
          dispatch(dispatchArgument)
        })
      }

      return newElement
    },
    morph: noop,
    raf
  })
})

test('dispatch multiple', (t) => {
  t.plan(3)

  require('./main.js')({
    target: initialElement,
    store (commit) {
      commit(() => '')

      return (arg) => {
        t.equal(arg, dispatchArgument)

        commit((state) => {
          return newState
        })
      }
    },
    component (app) {
      t.equal(app.state, newState)

      return newElement
    },
    morph: noop,
    raf
  })((dispatch) => {
    dispatch(dispatchArgument)

    dispatch(dispatchArgument)
  })
})
