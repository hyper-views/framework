import t from 'tap';

import {html} from '../../main.js';

t.test('text nodes -- static and dynamic', async () => {
  const el1 = /* prettier-ignore */ html`
    <div> 0 ${1} </div>
  `;

  t.has(el1, {
    views: [
      {
        type: 'node',
        name: 'div',
        dynamic: true,
        children: {
          length: 2,
          0: {type: 'text', value: ' 0 '},
          1: {type: 'variable', value: 0},
        },
      },
    ],
  });

  const el2 = /* prettier-ignore */ html`
    <div> ${0} 1 </div>
  `;

  t.has(el2, {
    views: [
      {
        type: 'node',
        name: 'div',
        dynamic: true,
        children: {
          length: 2,
          0: {type: 'variable', value: 0},
          1: {type: 'text', value: ' 1 '},
        },
      },
    ],
  });

  const el3 = /* prettier-ignore */ html`
    <div> ${0} ${1} </div>
  `;

  t.has(el3, {
    views: [
      {
        type: 'node',
        name: 'div',
        dynamic: true,
        children: {
          length: 2,
          0: {type: 'variable', value: 0},
          1: {type: 'variable', value: 1},
        },
      },
    ],
  });
});
