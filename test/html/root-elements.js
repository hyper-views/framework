import t from 'tap';

import {html} from '../../main.js';

t.test('allows multiple and text roots', async () => {
  const result1 = html`
    <div />
    <div />
  `;

  t.equal(result1.children.length, 2);

  const result2 = html`
    lorem ipsum
  `;

  t.equal(result2.children.length, 1);
});
