import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html, render} from '../../main.js';

const setTimeout = promisify(timers.setTimeout);

t.test('svg', async () => {
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
    <svg viewBox="0 0 10 10">
      <circle r="4" cx="5" cy="15" />
    </svg>
  `;

  render(view(), el);

  await setTimeout(0);

  t.has(el.childNodes, {
    length: 1,
    0: {nodeName: 'svg', childNodes: {length: 1, 0: {nodeName: 'circle'}}},
  });
});
