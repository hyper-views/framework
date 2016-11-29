const test = require('tape')
const mockery = require('mockery')
const noop = function () {}

test('test main - set-up', function (t) {
  let singlePage
  let theTarget = {}

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  t.plan(4)

  mockery.registerMock('single-page', function (callback) {
    t.ok(true)

    singlePage = callback

    return callback
  })

  mockery.registerMock('catch-links', function (target, callback) {
    t.equal(target, theTarget)

    t.equal(callback, singlePage)
  })

  require('./main.js')({
    target: theTarget,
    store: function () {
      return {}
    },
    component: noop,
    diff: noop,
    raf: noop
  })(function (app) {
    t.deepEqual(Object.keys(app), ['state', 'dispatch'])
  })

  mockery.disable()
})

test('test main - single-page > render', function (t) {
  let singlePage
  let theTarget = {}

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  t.plan(5)

  mockery.registerMock('single-page', function (callback) {
    singlePage = callback

    return callback
  })

  mockery.registerMock('catch-links', noop)

  require('./main.js')({
    target: theTarget,
    store: function (state = {}) {
      t.deepEqual({}, state)

      return {}
    },
    component: function (href) {
      t.equal(href, '/new-href')

      return function (app) {
        t.deepEqual(Object.keys(app), ['state', 'dispatch', 'show', 'next'])

        return {}
      }
    },
    diff: function (target, newTarget) {
      t.equal(target, theTarget)

      t.deepEqual(newTarget, {})
    },
    raf: function (callback) {
      process.nextTick(function () { callback() })
    }
  })

  singlePage('/new-href')

  mockery.disable()
})

test('test main - dispatch', function (t) {
  let singlePage
  let theTarget = {}
  let dispatchRun = false

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  t.plan(5)

  mockery.registerMock('single-page', function (callback) {
    singlePage = callback

    return callback
  })

  mockery.registerMock('catch-links', noop)

  require('./main.js')({
    target: theTarget,
    store: function (state = {}) {
      t.ok(true)

      return {}
    },
    component: function (href) {
      return function (app) {
        if (!dispatchRun) {
          dispatchRun = true

          process.nextTick(function () {
            app.dispatch()
            app.dispatch()
          }, 0)
        }

        return {}
      }
    },
    diff: function (target, newTarget) {
      t.ok(true)
    },
    raf: function (callback) {
      process.nextTick(function () { callback() })
    }
  })

  singlePage('/new-href')

  mockery.disable()
})

test('test main - next', function (t) {
  let singlePage
  let theTarget = {}
  let nextRun = false

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  t.plan(1)

  mockery.registerMock('single-page', function (callback) {
    singlePage = callback

    return callback
  })

  mockery.registerMock('catch-links', noop)

  require('./main.js')({
    target: theTarget,
    store: function (state = {}) {
      return {}
    },
    component: function (href) {
      return function (app) {
        if (!nextRun) {
          nextRun = true

          app.next(function (target) {
            t.deepEqual(target, theTarget)
          })
        }

        return {}
      }
    },
    diff: function (target, newTarget) {
    },
    raf: function (callback) {
      process.nextTick(function () { callback() })
    }
  })

  singlePage('/new-href')

  mockery.disable()
})
