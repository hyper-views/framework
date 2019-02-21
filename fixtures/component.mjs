import {html, safe} from '..'

const {main, h1, p, form, input, select, option, button, svg, path, div} = html

export default ({state}) => main(
  {},
  h1({}, state.heading),
  Boolean(state.hasSafe)
    ? safe(`<div>some</div><div>raw</div><div>html</div>`)
    : null,
  Boolean(state.hasP)
    ? p(
      {
        class: state.isRed ? 'red' : 'blue',
        [state.isRed ? 'data-red' : 'data-blue']: 'yes'
      },
      state.pText
    )
    : null,
  Boolean(state.hasForm) && state.formStep === 1
    ? form(
      {},
      input({value: '1'}),
      input({type: 'checkbox', checked: false}),
      select({}, ...[1, 2, 3, 4, 5, 6].map((v) => option({selected: v === 1}, v))),
      button({type: 'button', disabled: true, onclick() {}}, 'Next')
    )
    : null,
  Boolean(state.hasForm) && state.formStep === 2
    ? form(
      {onsubmit() {}},
      input({}),
      input({type: 'checkbox'}),
      select({}, ...[1, 2, 3].map((v) => option({selected: v === 2}, v))),
      button({type: 'submit', disabled: false}, 'Submit')
    )
    : null,
  Boolean(state.hasSvg)
    ? svg(
      {xmlns: 'http://www.w3.org/2000/svg'},
      path({d: 'M2 2 2 34 34 34 34 2 z'})
    )
    : null
)
