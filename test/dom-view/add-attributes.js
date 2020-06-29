import test from 'ava'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('add attributes', async (t) => {
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
        <input required placeholder="Add a Value" value="I'm the Value" />
      </body>
    `
  )

  view()

  await delay(0)

  const input = el.querySelector('input')

  t.deepEqual(input?.required, true)

  t.deepEqual(input?.placeholder, 'Add a Value')

  t.deepEqual(input?.value, "I'm the Value")
})
