const catchLinks = require('catch-links')
const singlePage = require('single-page')
const html = require('yo-yo')

module.exports = function ({target, store, component}) {
  let href
  const show = singlePage(function (h) {
    href = h

    render(store())
  })

  catchLinks(target, show)

  function dispatch () {
    render(store(...arguments))
  }

  function render (state) {
    const element = component({state, dispatch, href, show, html, next})

    html.update(target, element)
  }
}

function next (callback) {
  process.nextTick(callback)
}
