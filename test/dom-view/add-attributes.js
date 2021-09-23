import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {createDOMView} from '../../dom-view.js';
import {html} from '../../html.js';

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

  const view = createDOMView(
    el,
    () => html`
      <body>
        <input required placeholder="Add a Value" :value=${"I'm the Value"} />
      </body>
    `
  );

  view();

  await setTimeout(0);

  const input = el.querySelector('input');

  t.equal(input?.required, true);

  t.equal(input?.placeholder, 'Add a Value');

  t.equal(input?.value, "I'm the Value");
});
