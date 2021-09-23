import t from 'tap';

import {html, tokenTypes} from '../../html.js';

t.test('nodes -- static and dynamic', async () => {
  const el = html`
    <ul>
      <li>0</li>
      <li>${1}</li>
      <li><span>2</span></li>
    </ul>
  `;

  t.has(el, {
    type: tokenTypes.node,
    tag: 'ul',
    dynamic: true,
    children: {
      length: 3,
      0: {
        type: tokenTypes.node,
        tag: 'li',
        dynamic: false,
        children: {
          length: 1,
          0: {type: tokenTypes.text, value: '0'},
        },
      },
      1: {
        type: tokenTypes.node,
        tag: 'li',
        dynamic: true,
        children: {
          length: 1,
          0: {type: tokenTypes.variable, value: 0},
        },
      },
      2: {
        type: tokenTypes.node,
        tag: 'li',
        dynamic: false,
        children: {
          length: 1,
          0: {
            type: tokenTypes.node,
            tag: 'span',
            dynamic: false,
            children: {length: 1, 0: {type: tokenTypes.text, value: '2'}},
          },
        },
      },
    },
  });
});
