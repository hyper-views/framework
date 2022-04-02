import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html, render} from '../../main.js';

const setTimeout = promisify(timers.setTimeout);

t.test('add attributes', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body></body>
    </html>
  `);

  const el = dom.window.document.body;

  const view = () => html`
    <input
      :required=${true}
      :value=${"I'm the Value"}
      placeholder="Add a Value"
      data-not=${null}
    />
  `;

  render(view(), el);

  await setTimeout(0);

  const input = el.querySelector('input');

  t.equal(input?.required, true);

  t.equal(input?.placeholder, 'Add a Value');

  t.equal(input?.value, "I'm the Value");

  t.equal(input?.dataset?.not, undefined);
});
