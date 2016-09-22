const catchLinks = require('catch-links')
const singlePage = require('single-page')
const diffhtml = require('diffhtml')
const html = diffhtml.html

module.exports = function ({target, store, component}) {
  let href
  let state = store()
  let rafCalled = false

  const show = singlePage(function (newHref) {
    href = newHref

    render()
  })

  catchLinks(target, show)

  function dispatch () {
    state = store(state, ...arguments)

    render()
  }

  function render () {
    if (!rafCalled) {
      rafCalled = true

      window.requestAnimationFrame(() => {
        rafCalled = false

        const element = component(href)({state, dispatch, show, html, next})

        diffhtml.innerHTML(target, element)
      })
    }
  }

  function next (callback) {
    process.nextTick(function () {
      callback(target)
    })
  }
}
