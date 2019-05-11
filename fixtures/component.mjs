import {html, safe} from '..'

const {main, p, svg, step1, step2, option} = html

export default ({state}) => main`<main>
  <h1>${state.heading}</h1>
  ${Boolean(state.hasSafe)
    ? safe(`<div>some</div><div>raw</div><div>html</div>`)
    : null}
  ${Boolean(state.hasP)
    ? p`<p
        ${{
          class: state.isRed ? 'red' : 'blue',
          [state.isRed ? 'data-red' : 'data-blue']: 'yes'
        }}>
        ${state.pText}
      </p>`
    : null}
  ${Boolean(state.hasForm) && state.formStep === 1
    ? step1`<form>
        <input value='1' />
        <input type='checkbox' checked=${false} />
        <select>${[1, 2, 3, 4, 5, 6].map((v) => option`<option selected=${v === 1}>${v}</option>`)}</select>
        <button type=button disabled onclick=${() => {}}>Next</button>
      </form>`
    : null}
  ${Boolean(state.hasForm) && state.formStep === 2
    ? step2`<form
        onsubmit=${() => {}}>
        <input />
        <input type=checkbox />
        <select>${[1, 2, 3].map((v) => option`<option selected=${v === 2}>${v}</option>`)}</select>
        <button type=submit disabled=${false}>Submit</button>
      </form>`
    : null}
  ${Boolean(state.hasSvg)
    ? svg`<svg
        xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2 2 34 34 34 34 2 z" />
      </svg>`
    : null
  }
</main>`
