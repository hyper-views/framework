import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html, render} from '../../main.js';

const setTimeout = promisify(timers.setTimeout);

t.test('text to text', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>lorem ipsum dolor</body>
    </html>
  `);

  const el = dom.window.document.body;

  const view = () => /* prettier-ignore */ html`
      dolor ipsum lorem
    `;

  render(view(), el);

  await setTimeout(0);

  t.match(el.childNodes, {
    length: 1,
    0: {nodeValue: /^\s*dolor ipsum lorem\s*$/},
  });
});
