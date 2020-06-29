import test from 'ava'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('after update', async (t) => {
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
      <p class="has-no-support">testing</p>
    `
  }

  const view = createDomView(
    el,
    () => html`
      <body>
        ${afterUpdate}
      </body>
    `
  )

  view()

  await delay(0)

  const p = el.querySelector('p')

  t.deepEqual(p?.className, 'has-support')
})
