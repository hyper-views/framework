const catchLinks = require('catch-links')
const singlePage = require('single-page')
const diffhtml = require('diffhtml')
const html = diffhtml.html

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

    diffhtml.innerHTML(target, element)
  }
}

function next (callback) {
  process.nextTick(callback)
}
