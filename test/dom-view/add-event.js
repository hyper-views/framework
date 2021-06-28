import jsdom from 'jsdom'
import timers from 'timers'
import {promisify} from 'util'
import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {createDOMView} from '../../create-dom-view.js'
import {html} from '../../html.js'

const setTimeout = promisify(timers.setTimeout)

test('add event', async () => {
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

  let clicked = false

  const onclick = () => {
    clicked = true
  }

  const view = createDOMView(
    el,
    () => html`
      <body>
        <button type="button" @click=${onclick}>Click Me</button>
      </body>
    `
  )

  view()

  await setTimeout(0)

  const button = el.querySelector('button')

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}))

  await setTimeout(0)

  assert.is(clicked, true)
})
