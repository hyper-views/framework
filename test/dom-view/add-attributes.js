import test from 'uvu'
import * as assert from 'uvu/assert'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('add attributes', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body></body>
    </html>
  `)

  const el = dom.window.document.body

  const view = createDomView(
    el,
    () => html`
      <body>
        <input required placeholder="Add a Value" ${{value: "I'm the Value"}} />
      </body>
    `
  )

  view()

  await delay(0)

  const input = el.querySelector('input')

  assert.equal(input?.required, true)

  assert.equal(input?.placeholder, 'Add a Value')

  assert.equal(input?.value, "I'm the Value")
})
