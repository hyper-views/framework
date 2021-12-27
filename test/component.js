import jsdom from 'jsdom';
import t from 'tap';

import {register} from '../component.js';
import {html} from '../html.js';

t.test('add attributes', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
        <test-element x="1"></test-element>
      </body>
    </html>
  `);

  register(
    class {
      static tag = 'test-element';

      static attributes = ['x'];

      template = () => html`
        <div>
          <b>Test ${this.attributes.x}</b>
        </div>
      `;
    },
    dom.window
  );

  const el = dom.window.document.querySelector('test-element');

  const b = el?.shadowRoot.querySelector('b');

  t.equal(b?.innerHTML, 'Test 1');

  el.setAttribute('x', '2');

  t.equal(b?.innerHTML, 'Test 2');
});
