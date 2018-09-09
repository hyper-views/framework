const test = require('tape')
const noop = () => {}
const noopStore = (commit) => {
  commit(() => '')

  return {
    '*' () {
      commit(() => {
        return ''
      })
    }
  }
}
const raf = (callback) => {
  process.nextTick(() => { callback() })
}
const initialElement = Symbol('initial target')
const newElement = Symbol('new target')
const initialState = Symbol('initial state')
const newState = Symbol('new state')
const dispatchArgumnt = Symbol('dispatch argument')

test('init to render', (t) => {
  t.plan(14)

  require('./main.js')({
    target: initialElement,
    store (commit) {
      t.equal(commit.name, 'commit')

      t.equal(typeof commit, 'function')

      commit(() => initialState)

      return {
        '*' (arg) {
          t.equal(arg, dispatchArgumnt)

          commit((state) => {
            t.equal(state, initialState)

            return newState
          })
        }
      }
    },
    component (app) {
      t.deepEqual(Object.keys(app).length, 3)

      t.equal(app.dispatch.name, 'dispatch')

      t.equal(typeof app.dispatch, 'function')

      t.equal(app.next.name, 'next')

      t.equal(typeof app.next, 'function')

      t.equal(app.state, newState)

      return newElement
    },
    diff (target, newElement) {
      t.equal(target, initialElement)

      t.deepEqual(newElement, newElement)
    },
    raf
  })((dispatch) => {
    t.equal(dispatch.name, 'dispatch')

    t.equal(typeof dispatch, 'function')

    dispatch('*', dispatchArgumnt)
  })
})

test('using next', (t) => {
  t.plan(4)

  let i = 0

  require('./main.js')({
    target: initialElement,
    store: noopStore,
    component ({ next }) {
      next((target) => {
        t.equal(target, initialElement)

        t.equal(i, 0)

        i += 1
      })

      next((target) => {
        t.equal(target, initialElement)

        t.equal(i, 1)

        i += 1
      })

      return newElement
    },
    diff: noop,
    raf
  })
})

test('using dispatch', (t) => {
  t.plan(2)

  require('./main.js')({
    target: initialElement,
    store (commit) {
      commit(() => initialState)

      return {
        '*' (arg) {
          t.equal(arg, dispatchArgumnt)

          commit((state) => {
            t.equal(state, initialState)

            return newState
          })
        }
      }
    },
    component ({ dispatch, state }) {
      if (state === initialState) {
        process.nextTick(() => {
          dispatch('*', dispatchArgumnt)
        })
      }

      return newElement
    },
    diff: noop,
    raf
  })
})

test('dispatch multiple', (t) => {
  t.plan(2)

  require('./main.js')({
    target: initialElement,
    store (commit) {
      commit(() => '')

      return {
        '*' (arg) {
          t.equal(arg, dispatchArgumnt)

          commit((state) => {
            return newState
          })
        }
      }
    },
    component (app) {
      t.equal(app.state, newState)

      return newElement
    },
    diff: noop,
    raf
  })((dispatch) => {
    dispatch()

    dispatch('*', dispatchArgumnt)
  })
})
