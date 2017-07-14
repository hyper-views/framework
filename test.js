const test = require('tape')
const noop = function () {}
const noopStore = function (seed) {
  seed('')

  return function (commit) {
    commit(function () {
      return ''
    })
  }
}

test('test main - init', function (t) {
  let theTarget = {}

  t.plan(2)

  require('./main.js')({
    target: theTarget,
    store: noopStore,
    component: noop,
    diff: noop,
    raf: noop
  })(function ({dispatch, target}) {
    t.equal(typeof dispatch, 'function')
    t.equal(target, theTarget)
  })
})

test('test main - dispatch > render', function (t) {
  let theTarget = {}

  t.plan(6)

  require('./main.js')({
    target: theTarget,
    store: function (seed) {
      seed('')

      return function (commit, arg) {
        commit(function (state) {
          t.equal(state, '')

          t.equal(arg, 123)

          return 'test'
        })
      }
    },
    component: function (app) {
      t.deepEqual(Object.keys(app), ['state', 'dispatch', 'next'])

      t.equal(app.state, 'test')

      return {}
    },
    diff: function (target, newTarget) {
      t.equal(target, theTarget)

      t.deepEqual(newTarget, {})
    },
    raf: function (callback) {
      process.nextTick(function () { callback() })
    }
  })(function ({target, dispatch}) {
    dispatch(123)
  })
})

test('test main - next', function (t) {
  let theTarget = {}
  let nextRun = false

  t.plan(2)

  require('./main.js')({
    target: theTarget,
    store: noopStore,
    component: function (app) {
      if (!nextRun) {
        nextRun = true

        app.next(function ({target, dispatch}) {
          t.equal(typeof dispatch, 'function')
          t.equal(target, theTarget)
        })
      }

      return {}
    },
    diff: noop,
    raf: function (callback) {
      process.nextTick(function () { callback() })
    }
  })(function ({target, dispatch}) {
    dispatch()
  })
})
