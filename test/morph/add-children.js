import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html, render} from '../../main.js';

const setTimeout = promisify(timers.setTimeout);

t.test('add children', async () => {
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

  const view = () => html`
    <ul>
      <li>1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  `;

  render(view(), el);

  await setTimeout(0);

  t.has(el.childNodes, {
    length: 1,
    0: {nodeName: 'UL', childNodes: {length: 3}},
  });
});
