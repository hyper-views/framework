import t from 'tap';

import {html} from '../../main.js';

t.test('handles self closing and not', async () => {
  const div1 = html`
    <div />
  `;

  t.has(div1, {children: [{type: 6, name: 'div', dynamic: false}]});

  const div2 = html`
    <div></div>
  `;

  t.has(div2, {children: [{type: 6, name: 'div', dynamic: false}]});
});
