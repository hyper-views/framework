import test from 'ava'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('root after update', async (t) => {
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
      <body class="has-no-support">
        testing
      </body>
    `
  }

  const view = createDomView(el, () => afterUpdate)

  view()

  await delay(0)

  t.deepEqual(el.className, 'has-support')
})
