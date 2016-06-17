const catchLinks = require('catch-links')
const singlePage = require('single-page')
const loopOptions = {
  create: require('virtual-dom/create-element'),
  diff: require('virtual-dom/diff'),
  patch: require('virtual-dom/patch')
}
const vdom = require('virtual-dom')
const hyperx = require('hyperx')
const hx = hyperx(vdom.h)
const redux = require('redux')
const thunk = require('redux-thunk').default

module.exports = function (settings) {
  settings = Object.assign({
    reducers: {},
    middleware: [],
    routes: {},
    defaultComponent: function () {
      return hx``
    },
    target: document.querySelector('body')
  }, settings)

  settings.reducers.context = contextReducer

  settings.middleware.unshift(thunk)

  const store = redux.createStore(redux.combineReducers(settings.reducers), redux.applyMiddleware(...settings.middleware))
  const router = require('@erickmerchant/router')()
  const dispatch = store.dispatch
  const components = new Map()

  Object.keys(settings.routes).forEach(function (route) {
    components.set(route, settings.routes[route])

    router.add(route)
  })

  const show = singlePage(function (href) {
    var context = router.match(href)

    dispatch({type: 'SET_CONTEXT', context})
  })

  catchLinks(window, show)

  const mainLoop = require('main-loop')

  const loop = mainLoop(store.getState(), function (state) {
    let component = settings.defaultComponent

    if (state.context && components.has(state.context.route)) {
      component = components.get(state.context.route)
    }

    return component(state, {dispatch, next, show, hx})
  }, loopOptions)

  store.subscribe(function () {
    loop.update(store.getState())
  })

  settings.target.appendChild(loop.target)
}

function next (callback) {
  process.nextTick(callback)
}

function contextReducer (state = null, action) {
  if (action.type === 'SET_CONTEXT') {
    return action.context
  }

  return state
}
