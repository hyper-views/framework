import t from 'tap';

import {html} from '../../main.js';

t.test('throws on various quote issues', async () => {
  t.throws(() => {
    /* prettier-ignore */ html`
      <div foo=bar />
    `
  });

  t.throws(() => {
    html`
      <div foo="${'bar'}" />
    `;
  });
});
