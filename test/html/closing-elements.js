import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {html, tokenTypes} from '../../html.js'

test('handles self closing and not', () => {
  const div1 = html`
    <div />
  `

  assert.is(div1.type, tokenTypes.node)

  assert.is(div1.tag, 'div')

  assert.is(div1.dynamic, 0)

  const div2 = html`
    <div></div>
  `

  assert.is(div2.type, tokenTypes.node)

  assert.is(div2.tag, 'div')

  assert.is(div2.dynamic, 0)
})
