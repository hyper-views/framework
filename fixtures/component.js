const { main, h1, p, form, input, select, option, button, svg, path, div } = require('../html.js')

module.exports = function ({ state }) {
  return main(
    h1(state.heading),
    p(!!state.hasP, () => [
      {
        class: state.isRed ? 'red' : 'blue',
        [state.isRed ? 'data-red' : 'data-blue']: 'yes'
      },
      state.pText
    ]),
    form(!!state.hasForm && state.formStep === 1, () => [
      input({ value: '1' }),
      input({ type: 'checkbox', checked: false }),
      select(...[1, 2, 3, 4, 5, 6].map((v) => option({ selected: v === 1 }, v))),
      button({ type: 'button', disabled: true, onclick () { } }, 'Next')
    ]),
    form(!!state.hasForm && state.formStep === 2, () => [
      { onsubmit () {} },
      input({ }),
      input({ type: 'checkbox' }),
      select(...[1, 2, 3].map((v) => option({ selected: v === 2 }, v))),
      button({ type: 'submit', disabled: false }, 'Submit')
    ]),
    svg(!!state.hasSvg, () => [
      { xmlns: 'http://www.w3.org/2000/svg' },
      path({ d: 'M2 2 2 34 34 34 34 2 z' })
    ]),
    div(!!state.hasOnmount, ({ onmount }) => {
      onmount((el) => {
        el.innerHTML = 'onmount set'
      })
    }),
    div(!!state.hasOnupdate, ({ onupdate }) => {
      onupdate((el) => {
        el.innerHTML = 'onupdate set'
      })
    })
  )
}
