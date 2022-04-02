import t from 'tap';

import {html} from '../../main.js';

t.test('nodes -- static and dynamic', async () => {
  const el = html`
    <ul>
      <li>0</li>
      <li>${1}</li>
      <li><span>2</span></li>
    </ul>
  `;

  t.has(el, {
    views: [
      {
        type: 'node',
        tag: 'ul',
        dynamic: true,
        children: {
          length: 3,
          0: {
            type: 'node',
            tag: 'li',
            dynamic: false,
            children: {
              length: 1,
              0: {type: 'text', value: '0'},
            },
          },
          1: {
            type: 'node',
            tag: 'li',
            dynamic: true,
            children: {
              length: 1,
              0: {type: 'variable', value: 0},
            },
          },
          2: {
            type: 'node',
            tag: 'li',
            dynamic: false,
            children: {
              length: 1,
              0: {
                type: 'node',
                tag: 'span',
                dynamic: false,
                children: {length: 1, 0: {type: 'text', value: '2'}},
              },
            },
          },
        },
      },
    ],
  });
});
