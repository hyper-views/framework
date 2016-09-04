const catchLinks = require('catch-links')
const singlePage = require('single-page')
const diffhtml = require('diffhtml')
const html = diffhtml.html

module.exports = function ({target, store, component}) {
  let context = {}
  let state = store()
  const show = singlePage(function (href) {
    context.href = href

    render()
  })

  catchLinks(target, show)

  function dispatch () {
    render(...arguments)
  }

  function render () {
    state = store(state, ...arguments)

    window.requestAnimationFrame(() => {
      const element = component({state, dispatch, context, show, html, next})

      diffhtml.innerHTML(target, element)
    })
  }

  function next (callback) {
    process.nextTick(function () {
      callback(target)
    })
  }
}
