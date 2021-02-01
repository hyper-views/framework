import {test} from 'uvu'
import * as assert from 'uvu/assert'
import jsdom from 'jsdom'
import delay from 'delay'
import {createDomView, html} from '../../main.js'

test('remove children with keys', async () => {
  const dom = new jsdom.JSDOM(`
    <!doctype html>
    <html>
      <head>
        <title></title>
      </head>
      <body>
      </body>
    </html>
  `)

  const el = dom.window.document.body

  const view = createDomView(
    el,
    (state) => html`
      <body>
        <ul>
          ${state.map((item) => {
            return {
              key: item.id,
              value: html`
                <li>${item.title}</li>
              `
            }
          })}
        </ul>
      </body>
    `
  )

  view([
    {
      id: 1,
      title: 'One'
    },
    {
      id: 2,
      title: 'Two'
    },
    {
      id: 3,
      title: 'Three'
    }
  ])

  await delay(0)

  const list = el.querySelector('ul')

  const one = list.childNodes?.[1]
  const three = list.childNodes?.[3]

  assert.not(one == null)

  assert.not(three == null)

  view([
    {
      id: 1,
      title: 'One'
    },
    {
      id: 3,
      title: 'Three'
    }
  ])

  await delay(0)

  assert.is(one, list.childNodes?.[1])

  assert.is(three, list.childNodes?.[2])
})
