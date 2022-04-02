import t from 'tap';

import {html} from '../../main.js';

t.test('broken html does not timeout', async () => {
  t.throws(() => {
    /* prettier-ignore */ html`
      <div>
        <span
      </div>
    `;
  });
});
