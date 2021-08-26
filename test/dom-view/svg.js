import jsdom from 'jsdom'
import t from 'tap'
import timers from 'timers'
import {promisify} from 'util'

import {createDOMView} from '../../dom-view.js'
import {html} from '../../html.js'

const setTimeout = promisify(timers.setTimeout)

t.test('svg', async () => {
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

  const view = createDOMView(
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

  await setTimeout(0)

  t.has(el.childNodes, {
    length: 1,
    0: {nodeName: 'svg', childNodes: {length: 1, 0: {nodeName: 'circle'}}}
  })
})
