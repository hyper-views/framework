import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {html} from '../html.js'
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
                type="input"
                :id=${`value${i}`}
                :name=${`value${i}`}
                :placeholder=${'Add A Value'}
                @change=${() => {}}
              />
            `
          )}
        </fieldset>
        <button type="button" @click=${() => {}}>Submit</button>
      </form>
    `),
    `<form action="/submit"><fieldset><legend>Very Important Values</legend><input type="input" required id="value1" name="value1" placeholder="Add A Value"><input type="input" required id="value2" name="value2" placeholder="Add A Value"><input type="input" required id="value3" name="value3" placeholder="Add A Value"></fieldset><button type="button">Submit</button></form>`
  )
})
