import delay from 'delay'
import jsdom from 'jsdom'
import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {createDOMView} from '../../create-dom-view.js'
import {html} from '../../html.js'

test('no change - static', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
      </body>
    </html>
  `)

  const el = dom.window.document.body

  const view = createDOMView(
    el,
    () => html`
      <body>
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        <p>lorem ipsum dolor</p>
      </body>
    `
  )

  view()

  await delay(0)

  assert.is(el.childNodes?.length, 2)

  assert.is(el.childNodes?.[0]?.nodeName, 'UL')

  assert.is(el.childNodes?.[0]?.childNodes?.length, 3)

  assert.is(el.childNodes?.[1]?.nodeName, 'P')

  assert.is(el.childNodes?.[1]?.childNodes?.length, 1)

  view()

  await delay(0)

  assert.is(el.childNodes?.length, 2)

  assert.is(el.childNodes?.[0]?.nodeName, 'UL')

  assert.is(el.childNodes?.[0]?.childNodes?.length, 3)

  assert.is(el.childNodes?.[1]?.nodeName, 'P')

  assert.is(el.childNodes?.[1]?.childNodes?.length, 1)
})
