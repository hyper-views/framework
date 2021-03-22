import delay from 'delay'
import jsdom from 'jsdom'
import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {createDomView, html} from '../../main.js'

test('no change - dynamic', async () => {
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

  const item = (i) =>
    html`
      <li>${i}</li>
    `

  const view = createDomView(
    el,
    () => html`
      <body>
        <ul>
          ${[1, 2, 3].map((i) => item(i))}
        </ul>
        ${html`
          <p>lorem ipsum dolor</p>
        `}
      </body>
    `
  )

  view()

  await delay(0)

  assert.is(el.childNodes?.length, 5)

  assert.is(el.childNodes?.[1]?.nodeName, 'UL')

  assert.is(el.childNodes?.[1]?.childNodes?.length, 5)

  assert.is(el.childNodes?.[3]?.nodeName, 'P')

  assert.is(el.childNodes?.[3]?.childNodes?.length, 1)

  view()

  await delay(0)

  assert.is(el.childNodes?.length, 5)

  assert.is(el.childNodes?.[1]?.nodeName, 'UL')

  assert.is(el.childNodes?.[1]?.childNodes?.length, 5)

  assert.is(el.childNodes?.[3]?.nodeName, 'P')

  assert.is(el.childNodes?.[3]?.childNodes?.length, 1)
})
