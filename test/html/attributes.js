import t from 'tap';

import {html} from '../../main.js';

t.test('attributes', async () => {
  const el = /* prettier-ignore */ html`
    <div foo bar="a" baz='b' qux=${'c'} />
  `;

  t.has(el, {
    views: [
      {
        attributes: {
          length: 4,
          0: {key: 'qux', value: 0},
          1: {key: 'foo', value: true},
          2: {key: 'bar', value: 'a'},
          3: {key: 'baz', value: 'b'},
        },
      },
    ],
  });
});
