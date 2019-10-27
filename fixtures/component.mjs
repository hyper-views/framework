import {view, safe} from '..'

const {main, paragraph, svg} = view()

export default ({state}) => main`<main>
  <h1>${state.heading}</h1>
  <img src=${state.src} />
  ${Boolean(state.hasSafe)
    ? safe('<div>some</div><div>raw</div><div>html</div>')
    : null} ${Boolean(state.hasP)
    ? paragraph`<p ${{class: state.isRed ? 'red' : 'blue', [state.isRed ? 'data-red' : 'data-blue']: 'yes'}}>
        ${state.pText1} ${state.pText2} ${state.pText3}
      </p>`
    : null} ${Boolean(state.hasSvg)
    ? svg`<svg>
        <path d="M2 2 2 34 34 34 34 2 z" />
      </svg>`
    : null}
</main>`
