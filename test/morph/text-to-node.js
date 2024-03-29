import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html, render} from '../../main.js';

const setTimeout = promisify(timers.setTimeout);

t.test('text to node', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>lorem ipsum dolor</body>
    </html>
  `);

  const el = dom.window.document.body;

  const view =
    () => /* prettier-ignore */ html`
      <p>lorem ipsum dolor</p>
    `;

  render(view(), el);

  await setTimeout(0);

  t.has(el.childNodes, {
    length: 1,
    0: {nodeName: 'P', childNodes: {0: {nodeValue: 'lorem ipsum dolor'}}},
  });
});
