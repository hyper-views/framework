import delay from 'delay'
import jsdom from 'jsdom'
import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {createDOMView} from '../../create-dom-view.js'
import {html} from '../../html.js'

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

  const view = createDOMView(
    el,
    (state) => html`
      <body>
        <button type="button" @click=${onclicks[state]}>Click Me</button>
      </body>
    `
  )

  view(0)

  await delay(0)

  const button = el.querySelector('button')

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}))

  await delay(0)

  assert.is(clicked, 1)

  view(1)

  await delay(0)

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}))

  await delay(0)

  assert.is(clicked, 1)
})
