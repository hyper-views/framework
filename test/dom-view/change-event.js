import test from 'ava'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('change event', async (t) => {
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

  let clicked = -1
  let totalClicks = 0

  const onclicks = [
    () => {
      clicked = 0

      totalClicks++
    },
    () => {
      clicked = 1

      totalClicks++
    }
  ]

  const view = createDomView(
    el,
    (state) => html`
      <body>
        <button type="button" onclick=${onclicks[state]}>Click Me</button>
      </body>
    `
  )

  view(0)

  await delay(0)

  const button = el.querySelector('button')

  button.dispatchEvent(new dom.window.Event('click'))

  await delay(0)

  t.deepEqual(clicked, 0)

  view(1)

  await delay(0)

  button.dispatchEvent(new dom.window.Event('click'))

  await delay(0)

  t.deepEqual(clicked, 1)

  t.deepEqual(totalClicks, 2)
})
