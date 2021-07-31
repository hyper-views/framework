import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {html} from '../../html.js'

test('attributes', () => {
  const el = /* prettier-ignore */ html`
    <div foo bar="a" baz='b' qux=${'c'} />
  `

  assert.is(el.attributes?.length, 4)

  assert.is(el.attributes?.[0]?.key, 'qux')

  assert.is(el.attributes?.[0]?.value, 'c')

  assert.is(el.attributes?.[1]?.key, 'baz')

  assert.is(el.attributes?.[1]?.value, 'b')

  assert.is(el.attributes?.[2]?.key, 'bar')

  assert.is(el.attributes?.[2]?.value, 'a')

  assert.is(el.attributes?.[3]?.key, 'foo')

  assert.is(el.attributes?.[3]?.value, true)
})
