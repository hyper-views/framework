import jsdom from 'jsdom';
import t from 'tap';
import timers from 'timers';
import {promisify} from 'util';

import {html} from '../../html.js';
import {morph} from '../../morph.js';

const setTimeout = promisify(timers.setTimeout);

t.test('remove attributes', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
      </body>
    </html>
  `);

  const el = dom.window.document.body;

  const view = ({required, value, dataAttr}) => html`
    <body>
      <input :required=${required} :value=${value} data-attr=${dataAttr} />
    </body>
  `;

  morph(
    el,
    view({
      required: true,
      value: "I'm the Value",
      dataAttr: 'remove me',
    })
  );

  await setTimeout(0);

  const input1 = el.querySelector('input');

  t.equal(input1?.required, true);

  t.equal(input1?.value, "I'm the Value");

  t.equal(input1?.dataset.attr, 'remove me');

  morph(
    el,
    view({
      required: false,
      value: '',
      dataAttr: null,
    })
  );

  await setTimeout(0);

  const input2 = el.querySelector('input');

  t.equal(input2?.required, false);

  t.equal(input2?.value, '');

  t.equal(input2?.dataset.attr, undefined);
});
