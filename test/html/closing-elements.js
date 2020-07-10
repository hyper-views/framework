import test from 'uvu'
import * as assert from 'uvu/assert'
import {html} from '../../main.js'

test('handles self closing and not', () => {
  const div1 = html`
    <div />
  `

  assert.equal(div1.type, 'node')

  assert.equal(div1.tag, 'div')

  assert.equal(div1.dynamic, false)

  const div2 = html`
    <div></div>
  `

  assert.equal(div2.type, 'node')

  assert.equal(div2.tag, 'div')

  assert.equal(div2.dynamic, false)
})
