import t from 'tap';

import {html} from '../../html.js';

t.test('throws on root issues', async () => {
  t.throws(() => {
    html`
      <div />
      <div />
    `;
  });

  t.throws(() => {
    html`
      lorem ipsum dolor
    `;
  });
});
