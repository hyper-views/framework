import test from 'ava'
import {html} from '../../main.js'

test('throws on root issues', (t) => {
  t.throws(() => {
    html`
      <div />
      <div />
    `
  })

  t.throws(() => {
    html`
      lorem ipsum dolor
    `
  })
})
