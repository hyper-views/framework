import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html} from '../../html.js';
import {morph} from '../../morph.js';

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

  const view =
    () => /* prettier-ignore */ html`
      <body>lorem ipsum dolor</body>
    `;

  morph(el, view());

  await setTimeout(0);

  t.match(el.childNodes, {
    length: 1,
    0: {nodeValue: /^\s*lorem ipsum dolor\s*$/},
  });
});
