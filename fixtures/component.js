const { main, h1 } = require('../html.js')

module.exports = function ({ state }) {
  return main(h1(state.heading))
}
