import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html, render} from '../../main.js';

const setTimeout = promisify(timers.setTimeout);

t.test('node to text', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body><p>lorem ipsum dolor</p></body>
    </html>
  `);

  const el = dom.window.document.body;

  const view = () => /* prettier-ignore */ html`
      lorem ipsum dolor
    `;

  render(view(), el);

  await setTimeout(0);

  t.match(el.childNodes, {
    length: 1,
    0: {nodeValue: /^\s*lorem ipsum dolor\s*$/},
  });
});
