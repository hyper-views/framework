import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html} from '../../html.js';
import {morph} from '../../morph.js';

const setTimeout = promisify(timers.setTimeout);

t.test('node to node', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body><p>lorem ipsum dolor</p></body>
    </html>
  `);

  const el = dom.window.document.body;

  const view =
    () => /* prettier-ignore */ html`
      <body><ul><li>1</li><li>2</li><li>3</li></ul></body>
    `;

  morph(el, view());

  await setTimeout(0);

  t.has(el.childNodes, {
    length: 1,
    0: {nodeName: 'UL', childNodes: {length: 3}},
  });
});