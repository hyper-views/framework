const { main, h1 } = require('../vdom.js')

module.exports = function ({ state }) {
  return main(h1(state.heading))
}
