import test from 'ava'
import {html} from '../../main.js'

test('throws on various quote issues', (t) => {
  t.throws(() => {
    /* prettier-ignore */ html`
      <div foo=bar />
    `
  })

  t.throws(() => {
    html`
      <div foo="${'bar'}" />
    `
  })
})
