const catchLinks = require('catch-links')
const singlePage = require('single-page')

module.exports = function ({target, store, component, diff, raf}) {
  raf = raf != null ? raf : window.requestAnimationFrame

  let href
  let state = store()
  let rafCalled = false

  const show = singlePage(function (newHref) {
    href = newHref

    render()
  })

  catchLinks(target, show)

  return function (init) {
    init({state, dispatch})
  }

  function dispatch () {
    state = store(state, ...arguments)

    render()
  }

  function render () {
    if (!rafCalled) {
      rafCalled = true

      raf(() => {
        rafCalled = false

        const element = component(href)({state, dispatch, show, next})

        diff(target, element)
      })
    }
  }

  function next (callback) {
    process.nextTick(function () {
      callback(target)
    })
  }
}
