import test from 'ava'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('svg', async (t) => {
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

  const view = createDomView(
    el,
    () => html`
      <body>
        <svg viewBox="0 0 10 10">
          <circle r="4" cx="5" cy="15" />
        </svg>
      </body>
    `
  )

  view()

  await delay(0)

  t.deepEqual(el.childNodes?.length, 1)

  t.deepEqual(el.childNodes?.[0]?.nodeName, 'svg')

  t.deepEqual(el.childNodes?.[0]?.childNodes?.length, 1)

  t.deepEqual(el.childNodes?.[0]?.childNodes?.[0]?.nodeName, 'circle')
})
