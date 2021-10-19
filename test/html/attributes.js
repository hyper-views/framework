import t from 'tap';

import {html} from '../../html.js';

t.test('attributes', async () => {
  const el = /* prettier-ignore */ html`
    <div foo bar="a" baz='b' qux=${'c'} />
  `;

  t.has(el.attributes, {
    length: 4,
    0: {key: 'foo', value: true},
    1: {key: 'bar', value: 'a'},
    2: {key: 'baz', value: 'b'},
    3: {key: 'qux', value: 'c'},
  });
});
