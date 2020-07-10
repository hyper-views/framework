import test from 'uvu'
import * as assert from 'uvu/assert'
import {html} from '../../main.js'

test('throws on root issues', () => {
  assert.throws(() => {
    html`
      <div />
      <div />
    `
  })

  assert.throws(() => {
    html`
      lorem ipsum dolor
    `
  })
})
