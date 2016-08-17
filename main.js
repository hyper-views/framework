const catchLinks = require('catch-links')
const singlePage = require('single-page')
const html = require('yo-yo')

module.exports = function (store, component) {
  const show = singlePage(function (href) {
    dispatch('context', href)
  })

  const el = component(store(), {dispatch, next, show, html})

  catchLinks(el, show)

  return el

  function dispatch (type, data) {
    render(store(type, data))
  }

  function render (state) {
    const newEl = component(state, {dispatch, next, show, html})

    html.update(el, newEl)
  }
}

function next (callback) {
  process.nextTick(callback)
}
