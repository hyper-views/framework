import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html} from '../../html.js';
import {morph} from '../../morph.js';

const setTimeout = promisify(timers.setTimeout);

t.test('change event', async () => {
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

  let clicked = -1;
  let totalClicks = 0;

  const onclicks = [
    () => {
      clicked = 0;

      totalClicks++;
    },
    () => {
      clicked = 1;

      totalClicks++;
    },
  ];

  const view = (state) => html`
    <body>
      <button type="button" @click=${onclicks[state]}>Click Me</button>
    </body>
  `;

  morph(el, view(0));

  await setTimeout(0);

  const button = el.querySelector('button');

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}));

  await setTimeout(0);

  t.equal(clicked, 0);

  morph(el, view(1));

  await setTimeout(0);

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}));

  await setTimeout(0);

  t.equal(clicked, 1);

  t.equal(totalClicks, 2);
});
