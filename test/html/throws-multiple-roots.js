import test from 'ava'
import {html} from '../../main.js'

test('throws on multiple root nodes', (t) => {
  t.throws(() => {
    html`
      <div />
      <div />
    `
  })
})
