import jsdom from 'jsdom'
import t from 'tap'
import timers from 'timers'
import {promisify} from 'util'

import {createDOMView} from '../../dom-view.js'
import {html} from '../../html.js'

const setTimeout = promisify(timers.setTimeout)

t.test('remove text', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
        lorem ipsum
      </body>
    </html>
  `)

  const el = dom.window.document.body

  const view = createDOMView(
    el,
    () => html`
      <body></body>
    `
  )

  view()

  await setTimeout(0)

  t.equal(el.childNodes?.length, 0)
})
