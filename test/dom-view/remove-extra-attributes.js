import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {createDOMView} from '../../dom-view.js';
import {html} from '../../html.js';

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

  const view = createDOMView(el, (state) =>
    state?.class
      ? html`
          <div><div :class=${state?.class}>I have a class</div></div>
        `
      : html`
          <div><div>I do not</div></div>
        `
  );

  view({class: 'test'});

  await setTimeout(0);

  t.has(el.childNodes, {
    0: {className: 'test'},
  });

  view();

  await setTimeout(0);

  t.has(el.childNodes, {
    0: {className: ''},
  });
});
