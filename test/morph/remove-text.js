import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html, render} from '../../main.js';

const setTimeout = promisify(timers.setTimeout);

t.test('remove text', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
        lorem ipsum
      </body>
    </html>
  `);

  const el = dom.window.document.body;

  const view = () => html``;

  render(view(), el);

  await setTimeout(0);

  t.equal(el.childNodes?.length, 0);
});
