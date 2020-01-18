import {view, raw} from '..'

const {main, paragraph, svg} = view()

export const component = ({state}) => main`<main>
  <h1>${state.heading}</h1>
  <img src=${state.src} />
  <button onclick=${state.onclick} type="button">Approve</button>
  ${
    Boolean(state.hasRaw)
    ? raw('<div>some</div><div>raw</div><div>html</div>')
    : null
  } ${
    Boolean(state.hasP)
    ? paragraph`<p ${{class: state.isRed ? 'red' : 'blue', [state.isRed ? 'data-red' : 'data-blue']: 'yes'}}>
        ${state.pText1} ${state.pText2} ${state.pText3}
      </p>`
    : null
  } ${
    Boolean(state.hasSvg)
    ? svg`<svg>
        <path d=${state.svgPath} />
      </svg>`
    : null
  }
</main>`
