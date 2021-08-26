import jsdom from 'jsdom'
import t from 'tap'
import timers from 'timers'
import {promisify} from 'util'

import {createDOMView} from '../../dom-view.js'
import {html} from '../../html.js'

const setTimeout = promisify(timers.setTimeout)

t.test('remove children', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
        </ul>
      </body>
    </html>
  `)

  const el = dom.window.document.body

  const view = createDOMView(
    el,
    () => html`
      <body>
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
      </body>
    `
  )

  view()

  await setTimeout(0)

  t.has(el.childNodes, {
    length: 1,
    0: {nodeName: 'UL', childNodes: {length: 3}}
  })
})
