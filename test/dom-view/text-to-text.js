import test from 'uvu'
import * as assert from 'uvu/assert'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('text to text', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>lorem ipsum dolor</body>
    </html>
  `)

  const el = dom.window.document.body

  const view = createDomView(
    el,
    () => /* prettier-ignore */ html`
      <body>dolor ipsum lorem</body>
    `
  )

  view()

  await delay(0)

  assert.equal(el.childNodes?.length, 1)

  assert.equal(el.childNodes?.[0]?.nodeValue, 'dolor ipsum lorem')
})
