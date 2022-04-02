import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html, render} from '../../main.js';

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

  const a = () => {
    clicked = 0;

    totalClicks++;
  };
  const b = () => {
    clicked = 1;

    totalClicks++;
  };

  const onclicks = [a, b];

  const view = (state) => html`
    <button type="button" @click=${onclicks[state]}>Click Me</button>
  `;

  render(view(0), el);

  await setTimeout(0);

  const button = el.querySelector('button');

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}));

  await setTimeout(0);

  t.equal(clicked, 0);

  t.equal(totalClicks, 1);

  render(view(1), el);

  await setTimeout(0);

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}));

  await setTimeout(0);

  t.equal(clicked, 1);

  t.equal(totalClicks, 2);
});
