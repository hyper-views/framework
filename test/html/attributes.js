import t from 'tap';

import {html} from '../../html.js';

t.test('attributes', async () => {
  const el = /* prettier-ignore */ html`
    <div foo bar="a" baz='b' qux=${'c'} />
  `;

  t.has(el.attributes, {
    length: 4,
    0: {key: 'qux', value: 'c'},
    1: {key: 'baz', value: 'b'},
    2: {key: 'bar', value: 'a'},
    3: {key: 'foo', value: true},
  });
});
