import t from 'tap';

import {html} from '../../main.js';

t.test('allows multiple roots', async () => {
  const result1 = html`
    <div />
    <div />
  `;

  t.equal(result1.views.length, 2);

  const result2 = html`
    lorem ipsum
  `;

  t.equal(result2.views.length, 1);
});
