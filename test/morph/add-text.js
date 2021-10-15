import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html} from '../../html.js';
import {morph} from '../../morph.js';

const setTimeout = promisify(timers.setTimeout);

t.test('add text', async () => {
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
    <body>
      lorem ipsum
    </body>
  `;

  morph(el, view());

  await setTimeout(0);

  t.match(el.childNodes, {length: 1, 0: {nodeValue: /^\s*lorem ipsum\s*$/}});
});
