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

test('init to render', function (t) {
  let theTarget = {}

  t.plan(9)

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
      t.deepEqual(Object.keys(app).length, 3)

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
  })(function (app) {
    t.deepEqual(Object.keys(app).length, 2)

    t.equal(typeof app.dispatch, 'function')

    t.equal(app.target, theTarget)

    app.dispatch(123)
  })
})

test('using next', function (t) {
  let theTarget = {}

  t.plan(3)

  require('./main.js')({
    target: theTarget,
    store: noopStore,
    component: function ({next}) {
      next(function (app) {
        t.deepEqual(Object.keys(app).length, 2)

        t.equal(typeof app.dispatch, 'function')

        t.equal(app.target, theTarget)
      })

      return {}
    },
    diff: noop,
    raf: function (callback) {
      process.nextTick(function () { callback() })
    }
  })()
})

test('seed with function', function (t) {
  let theTarget = {}

  t.plan(1)

  require('./main.js')({
    target: theTarget,
    store: function (seed) {
      seed(function (commit) {
        t.equal(typeof commit, 'function')

        return ''
      })

      return noop
    },
    component: noop,
    diff: noop,
    raf: noop
  })()
})

test('dispatch multiple', function (t) {
  let theTarget = {}

  t.plan(4)

  require('./main.js')({
    target: theTarget,
    store: function (seed) {
      seed('')

      return function (commit, arg) {
        commit(function (state) {
          t.equal(arg, 123)

          return 'test'
        })
      }
    },
    component: function (app) {
      t.deepEqual(Object.keys(app).length, 3)

      t.equal(app.state, 'test')

      return {}
    },
    diff: noop,
    raf: function (callback) {
      process.nextTick(function () { callback() })
    }
  })(function ({dispatch}) {
    dispatch(123)

    dispatch(123)
  })
})
