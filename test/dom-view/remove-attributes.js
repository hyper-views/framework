import test from 'uvu'
import * as assert from 'uvu/assert'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('remove attributes', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
        <input required placeholder="Add a Value" value="I'm the Value" />
      </body>
    </html>
  `)

  const el = dom.window.document.body

  const view = createDomView(
    el,
    () => html`
      <body>
        <input required=${false} placeholder=${null} ${{value: null}} />
      </body>
    `
  )

  view()

  await delay(0)

  const input = el.querySelector('input')

  assert.equal(input?.required, false)

  assert.equal(input?.placeholder, '')

  assert.equal(input?.value, '')
})
