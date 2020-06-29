import test from 'ava'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('text to node', async (t) => {
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
      <body><p>lorem ipsum</p></body>
    `
  )

  view()

  await delay(0)

  t.deepEqual(el.childNodes?.length, 1)

  t.deepEqual(el.childNodes?.[0]?.nodeName, 'P')
})
