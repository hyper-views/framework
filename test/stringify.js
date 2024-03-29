import t from 'tap';

import {html} from '../main.js';
import {stringify} from '../stringify.js';

t.test('stringify', async () => {
  t.equal(
    stringify(html`
      <form action=${'/submit'}>
        <fieldset>
          <legend>Very Important ${'Values'}</legend>
          ${[1, 2, 3].map(
            (i) => html`
              <input
                required
                type="input"
                id=${`value${i}`}
                name=${`value${i}`}
                placeholder=${'Add A Value'}
                value=${i}
                @change=${() => {}}
                data-not=${null}
              />
            `
          )}
        </fieldset>
        <button type="button" @click=${() => {}}>Submit</button>
      </form>
    `),
    `<form action="/submit"><fieldset><legend>Very Important Values</legend><input value="1" placeholder="Add A Value" name="value1" id="value1" required type="input"><input value="2" placeholder="Add A Value" name="value2" id="value2" required type="input"><input value="3" placeholder="Add A Value" name="value3" id="value3" required type="input"></fieldset><button type="button">Submit</button></form>`
  );
});
