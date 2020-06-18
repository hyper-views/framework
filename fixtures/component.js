import {html} from '../main.js'

export const component = (state) => html`
  <main>
    <h1>${state.heading}</h1>
    <img src=${state.src} />
    <button onclick=${state.onclick} type="button">Approve</button>
    ${
      state.hasP
      ? html`<p ${{class: state.isRed ? 'red' : 'blue'}}>
          ${state.pText1} ${state.pText2} ${state.pText3}
        </p>`
      : null
    } ${
      state.hasSvg
      ? html`<svg>
          <path d=${state.svgPath} />
        </svg>`
      : null
    }
  </main>
`
