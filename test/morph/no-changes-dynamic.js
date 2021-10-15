import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html} from '../../html.js';
import {morph} from '../../morph.js';

const setTimeout = promisify(timers.setTimeout);

t.test('no change - dynamic', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
      </body>
    </html>
  `);

  const el = dom.window.document.body;

  const item = (i) =>
    html`
      <li>${i}</li>
    `;

  const view = () => html`
    <body>
      <ul>
        ${[1, 2, 3].map((i) => item(i))}
      </ul>
      ${html`
        <p>lorem ipsum dolor</p>
      `}
    </body>
  `;

  morph(el, view());

  await setTimeout(0);

  t.has(el.childNodes, {
    length: 2,
    0: {nodeName: 'UL', childNodes: {length: 3}},
    1: {nodeName: 'P', childNodes: {length: 1}},
  });

  morph(el, view());

  await setTimeout(0);

  t.has(el.childNodes, {
    length: 2,
    0: {nodeName: 'UL', childNodes: {length: 3}},
    1: {nodeName: 'P', childNodes: {length: 1}},
  });
});
