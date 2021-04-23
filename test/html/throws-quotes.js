import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {html} from '../../html.js'

test('throws on various quote issues', () => {
  assert.throws(() => {
    /* prettier-ignore */ html`
      <div foo=bar />
    `
  })

  assert.throws(() => {
    html`
      <div foo="${'bar'}" />
    `
  })
})
