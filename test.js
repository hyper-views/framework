const test = require('tape')
const noop = function () {}
const noopStore = function (commit) {
  commit(() => '')

  return {
    '*': () => {
      commit(function () {
        return ''
      })
    }
  }
}
const raf = function (callback) {
  process.nextTick(function () { callback() })
}
const initialElement = Symbol('initial target')
const newElement = Symbol('new target')
const initialState = Symbol('initial state')
const newState = Symbol('new state')
const dispatchArgumnt = Symbol('dispatch argument')

test('init to render', function (t) {
  t.plan(14)

  require('./main.js')({
    target: initialElement,
    store (commit) {
      t.equal(commit.name, 'commit')

      t.equal(typeof commit, 'function')

      commit(() => initialState)

      return {
        '*': (arg) => {
          t.equal(arg, dispatchArgumnt)

          commit(function (state) {
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
  })(function (dispatch) {
    t.equal(dispatch.name, 'dispatch')

    t.equal(typeof dispatch, 'function')

    dispatch('*', dispatchArgumnt)
  })
})

test('using next', function (t) {
  t.plan(4)

  let i = 0

  require('./main.js')({
    target: initialElement,
    store: noopStore,
    component ({ next }) {
      next(function (target) {
        t.equal(target, initialElement)

        t.equal(i, 0)

        i += 1
      })

      next(function (target) {
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

test('using dispatch', function (t) {
  t.plan(2)

  require('./main.js')({
    target: initialElement,
    store (commit) {
      commit(() => initialState)

      return {
        '*': (arg) => {
          t.equal(arg, dispatchArgumnt)

          commit(function (state) {
            t.equal(state, initialState)

            return newState
          })
        }
      }
    },
    component ({ dispatch, state }) {
      if (state === initialState) {
        process.nextTick(function () {
          dispatch('*', dispatchArgumnt)
        })
      }

      return newElement
    },
    diff: noop,
    raf
  })
})

test('dispatch multiple', function (t) {
  t.plan(2)

  require('./main.js')({
    target: initialElement,
    store (commit) {
      commit(() => '')

      return {
        '*': (arg) => {
          t.equal(arg, dispatchArgumnt)

          commit(function (state) {
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
  })(function (dispatch) {
    dispatch()

    dispatch('*', dispatchArgumnt)
  })
})
