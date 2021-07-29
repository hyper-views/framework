import jsdom from 'jsdom'
import timers from 'timers'
import {promisify} from 'util'
import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {createDOMView} from '../../dom-view.js'
import {html} from '../../html.js'

const setTimeout = promisify(timers.setTimeout)

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

  await setTimeout(0)

  const button = el.querySelector('button')

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}))

  await setTimeout(0)

  assert.is(clicked, 1)

  view(1)

  await setTimeout(0)

  button.dispatchEvent(new dom.window.Event('click', {bubbles: true}))

  await setTimeout(0)

  assert.is(clicked, 1)
})
