import t from 'tap';

import {html, tokenTypes} from '../../html.js';

t.test('text nodes -- static and dynamic', async () => {
  const el1 = /* prettier-ignore */ html`
    <div> 0 ${1} </div>
  `;

  t.has(el1, {
    type: tokenTypes.node,
    tag: 'div',
    dynamic: true,
    children: {
      length: 2,
      0: {type: tokenTypes.text, value: ' 0 '},
      1: {type: tokenTypes.variable, value: 0},
    },
  });

  const el2 = /* prettier-ignore */ html`
    <div> ${0} 1 </div>
  `;

  t.has(el2, {
    type: tokenTypes.node,
    tag: 'div',
    dynamic: true,
    children: {
      length: 2,
      0: {type: tokenTypes.variable, value: 0},
      1: {type: tokenTypes.text, value: ' 1 '},
    },
  });

  const el3 = /* prettier-ignore */ html`
    <div> ${0} ${1} </div>
  `;

  t.has(el3, {
    type: tokenTypes.node,
    tag: 'div',
    dynamic: true,
    children: {
      length: 2,
      0: {type: tokenTypes.variable, value: 0},
      1: {type: tokenTypes.variable, value: 1},
    },
  });
});
