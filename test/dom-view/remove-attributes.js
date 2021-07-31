import jsdom from 'jsdom'
import timers from 'timers'
import {promisify} from 'util'
import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {createDOMView} from '../../dom-view.js'
import {html} from '../../html.js'

const setTimeout = promisify(timers.setTimeout)

test('remove attributes', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
        <input required placeholder="Add a Value" value="I'm the Value" />
      </body>
    </html>
  `)

  const el = dom.window.document.body

  const view = createDOMView(
    el,
    () => html`
      <body>
        <input :required=${false} :placeholder=${null} :value=${null} />
      </body>
    `
  )

  view()

  await setTimeout(0)

  const input = el.querySelector('input')

  assert.is(input?.required, false)

  assert.is(input?.placeholder, '')

  assert.is(input?.value, '')
})
