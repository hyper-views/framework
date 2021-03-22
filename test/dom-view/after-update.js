import delay from 'delay'
import jsdom from 'jsdom'
import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {createDomView, html} from '../../main.js'

test('after update', async () => {
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

  const afterUpdate = (afterUpdate) => {
    afterUpdate((el) => {
      el.className = 'has-support'
    })

    return html`
      <p class="has-no-support">testing</p>
    `
  }

  const view = createDomView(
    el,
    () => html`
      <body>
        ${afterUpdate}
      </body>
    `
  )

  view()

  await delay(0)

  const p = el.querySelector('p')

  assert.is(p?.className, 'has-support')
})
