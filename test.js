var test = require('tape')
var mockery = require('mockery')

test('test main', function (t) {
  let singlePage
  let theTarget = {}
  let dispatchRun = false
  let nextRun = false

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  t.plan(12)

  mockery.registerMock('single-page', function (callback) {
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
    component: function (href) {
      t.equal(href, '/new-href')

      return function (app) {
        t.deepEqual(Object.keys(app), ['state', 'dispatch', 'show', 'next'])

        if (!dispatchRun) {
          dispatchRun = true

          process.nextTick(function () {
            app.dispatch()
            app.dispatch()
          }, 0)
        }

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
      t.equal(target, theTarget)

      t.deepEqual(newTarget, {})
    },
    raf: function (callback) {
      process.nextTick(function () { callback() })
    }
  })(function (app) {
    t.deepEqual(Object.keys(app), ['state', 'dispatch'])
  })

  singlePage('/new-href')

  mockery.disable()
})
