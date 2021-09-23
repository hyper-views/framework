import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {createDOMView} from '../../dom-view.js';
import {html} from '../../html.js';

const setTimeout = promisify(timers.setTimeout);

t.test('remove event', async () => {
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

  let clicked = 0;

  const onclicks = [
    () => {
      clicked++;
    },
    null,
  ];

  const view = createDOMView(
    el,
    (state) => html`
      <body>
        <button type="button" @click=${onclicks[state]}>Click Me</button>
      </body>
    `
  );

  view(0);

  await setTimeout(0);

  const button = el.querySelector('button');

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}));

  await setTimeout(0);

  t.equal(clicked, 1);

  view(1);

  await setTimeout(0);

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}));

  await setTimeout(0);

  t.equal(clicked, 1);
});
