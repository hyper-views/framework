import t from 'tap';

import {html, tokenTypes} from '../../html.js';

t.test('handles self closing and not', async () => {
  const div1 = html`
    <div />
  `;

  t.equal(div1.type, tokenTypes.node);

  t.equal(div1.tag, 'div');

  t.equal(div1.dynamic, false);

  const div2 = html`
    <div></div>
  `;

  t.equal(div2.type, tokenTypes.node);

  t.equal(div2.tag, 'div');

  t.equal(div2.dynamic, false);
});
