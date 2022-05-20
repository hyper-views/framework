import t from 'tap';

import {html} from '../../main.js';

t.test('attributes', async () => {
  const el = /* prettier-ignore */ html`
    <div foo1 foo2="a" foo3='b' foo4=${'c'} foo4="${'d'}" foo5='${'e'}' />
  `;

  t.has(el, {
    views: [
      {
        attributes: {
          length: 6,
          0: {key: 'foo4', value: 0},
          1: {key: 'foo1', value: true},
          2: {key: 'foo2', value: 'a'},
          3: {key: 'foo3', value: 'b'},
          4: {key: 'foo4', value: 'd'},
          5: {key: 'foo5', value: 'e'},
        },
      },
    ],
  });
});
