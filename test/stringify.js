import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {html} from '../main.js'
import {stringify} from '../stringify.js'

test('stringify', () => {
  assert.is(
    stringify(html`
      <form action=${'/submit'}>
        <fieldset>
          <legend>Very Important ${'Values'}</legend>
          ${[1, 2, 3].map(
            (i) => html`
              <input
                required
                id=${`value${i}`}
                name=${`value${i}`}
                type="input"
                ${{placeholder: 'Add A Value', onchange() {}}}
              />
            `
          )}
        </fieldset>
        ${() =>
          html`
            <button type="button" onclick=${() => {}}>Submit</button>
          `}
      </form>
    `),
    `<form action="/submit">
        <fieldset>
          <legend>Very Important Values</legend>
          <input required id="value1" name="value1" type="input" placeholder="Add A Value"><input required id="value2" name="value2" type="input" placeholder="Add A Value"><input required id="value3" name="value3" type="input" placeholder="Add A Value">
        </fieldset>
        <button type="button">Submit</button>
      </form>`
  )
})
