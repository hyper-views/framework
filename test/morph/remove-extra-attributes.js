import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html} from '../../html.js';
import {morph} from '../../morph.js';

const setTimeout = promisify(timers.setTimeout);

t.test('do not reuse elements between different templates', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
        <div></div>
      </body>
    </html>
  `);

  const el = dom.window.document.querySelector('div');

  const view = (state) =>
    state?.class
      ? html`
          <div><div class=${state?.class}>I have a class</div></div>
        `
      : html`
          <div><div>I do not</div></div>
        `;

  morph(el, view({class: 'test'}));

  await setTimeout(0);

  t.has(el.childNodes, {
    0: {className: 'test'},
  });

  morph(el, view());

  await setTimeout(0);

  t.has(el.childNodes, {
    0: {className: ''},
  });
});
