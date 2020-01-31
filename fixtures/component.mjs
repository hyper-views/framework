import {html, raw} from '../main.mjs'

export const component = ({state}) => html`<main>
  <h1>${state.heading}</h1>
  <img src=${state.src} />
  <button onclick=${state.onclick} type="button">Approve</button>
  ${
    Boolean(state.hasRaw)
    ? raw('<div>some</div><div>raw</div><div>html</div>')
    : null
  } ${
    Boolean(state.hasP)
    ? html`<p ${{class: state.isRed ? 'red' : 'blue', [state.isRed ? 'data-red' : 'data-blue']: 'yes'}}>
        ${state.pText1} ${state.pText2} ${state.pText3}
      </p>`
    : null
  } ${
    Boolean(state.hasSvg)
    ? html`<svg>
        <path d=${state.svgPath} />
      </svg>`
    : null
  }
</main>`
