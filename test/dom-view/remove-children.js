import test from 'uvu'
import * as assert from 'uvu/assert'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('remove children', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
        </ul>
      </body>
    </html>
  `)

  const el = dom.window.document.body

  const view = createDomView(
    el,
    () => html`
      <body>
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
      </body>
    `
  )

  view()

  await delay(0)

  assert.equal(el.childNodes?.length, 1)

  assert.equal(el.childNodes?.[0]?.nodeName, 'UL')

  assert.equal(el.childNodes?.[0]?.childNodes?.length, 3)
})
