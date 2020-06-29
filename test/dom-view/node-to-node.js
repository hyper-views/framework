import test from 'ava'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('node to node', async (t) => {
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
      <body><ul><li>1</li><li>2</li><li>3</li></ul></body>
    `
  )

  view()

  await delay(0)

  t.deepEqual(el.childNodes?.length, 1)

  t.deepEqual(el.childNodes?.[0]?.nodeName, 'UL')

  t.deepEqual(el.childNodes?.[0]?.children?.length, 3)
})
