const test = require('tape')
const noop = function () {}

test('test main - init', function (t) {
  let theTarget = {}

  t.plan(2)

  require('./main.js')({
    target: theTarget,
    store: function () {
      return {}
    },
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

  t.plan(3)

  require('./main.js')({
    target: theTarget,
    store: function (state = {}) {
      return state
    },
    component: function (app) {
      t.deepEqual(Object.keys(app), ['state', 'dispatch', 'next'])

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
    dispatch()
  })
})

test('test main - next', function (t) {
  let theTarget = {}
  let nextRun = false

  t.plan(2)

  require('./main.js')({
    target: theTarget,
    store: function (state = {}) {
      return {}
    },
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
