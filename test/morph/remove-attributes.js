import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html} from '../../html.js';
import {morph} from '../../morph.js';

const setTimeout = promisify(timers.setTimeout);

t.test('remove attributes', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
        <input required placeholder="Add a Value" value="I'm the Value" />
      </body>
    </html>
  `);

  const el = dom.window.document.body;

  const view = () => html`
    <body>
      <input :required=${false} :placeholder=${null} :value=${null} />
    </body>
  `;

  morph(el, view());

  await setTimeout(0);

  const input = el.querySelector('input');

  t.equal(input?.required, false);

  t.equal(input?.placeholder, '');

  t.equal(input?.value, '');
});
