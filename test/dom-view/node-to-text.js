import jsdom from 'jsdom'
import timers from 'timers'
import {promisify} from 'util'
import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {createDOMView} from '../../create-dom-view.js'
import {html} from '../../html.js'

const setTimeout = promisify(timers.setTimeout)

test('node to text', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body><p>lorem ipsum dolor</p></body>
    </html>
  `)

  const el = dom.window.document.body

  const view = createDOMView(
    el,
    () => /* prettier-ignore */ html`
      <body>lorem ipsum dolor</body>
    `
  )

  view()

  await setTimeout(0)

  assert.is(el.childNodes?.length, 1)

  assert.is(el.childNodes?.[0]?.nodeValue?.trim(), 'lorem ipsum dolor')
})
