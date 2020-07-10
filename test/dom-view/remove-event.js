import test from 'uvu'
import * as assert from 'uvu/assert'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('remove event', async () => {
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

  let clicked = 0

  const onclicks = [
    () => {
      clicked++
    },
    null
  ]

  const view = createDomView(
    el,
    (state) => html`
      <body>
        <button type="button" onclick=${onclicks[state]}>Click Me</button>
      </body>
    `
  )

  view(0)

  await delay(0)

  const button = el.querySelector('button')

  button.dispatchEvent(new dom.window.Event('click'))

  await delay(0)

  assert.equal(clicked, 1)

  view(1)

  await delay(0)

  button.dispatchEvent(new dom.window.Event('click'))

  await delay(0)

  assert.equal(clicked, 1)
})
