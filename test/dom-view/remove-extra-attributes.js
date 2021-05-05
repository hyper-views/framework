import delay from 'delay'
import jsdom from 'jsdom'
import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {createDomView} from '../../create-dom-view.js'
import {html} from '../../html.js'

test('do not reuse elements between different templates', async () => {
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
  `)

  const el = dom.window.document.querySelector('div')

  const view = createDomView(el, (state) =>
    state?.class
      ? html`
          <div><div :class=${state?.class}>I have a class</div></div>
        `
      : html`
          <div><div>I do not</div></div>
        `
  )

  view({class: 'test'})

  await delay(0)

  assert.is(el.childNodes[0].className, 'test')

  view()

  await delay(0)

  assert.is(el.childNodes[0].className, '')
})
