import test from 'uvu'
import * as assert from 'uvu/assert'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

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

  const view = createDomView(
    el,
    () => /* prettier-ignore */ html`
      <body>lorem ipsum dolor</body>
    `
  )

  view()

  await delay(0)

  assert.equal(el.childNodes?.length, 1)

  assert.equal(el.childNodes?.[0]?.nodeValue?.trim(), 'lorem ipsum dolor')
})
