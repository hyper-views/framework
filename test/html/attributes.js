import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {html, tokenTypes} from '../../html.js'

test('attributes', () => {
  const el = /* prettier-ignore */ html`
    <div foo bar="a" baz='b' :qux=${'c'} ${{'doo': 'd'}} />
  `

  assert.is(el.attributes?.length, 5)

  assert.is(el.attributes?.[0]?.key, 'baz')

  assert.is(el.attributes?.[0]?.value, 'b')

  assert.is(el.attributes?.[1]?.key, 'bar')

  assert.is(el.attributes?.[1]?.value, 'a')

  assert.is(el.attributes?.[2]?.key, 'foo')

  assert.is(el.attributes?.[2]?.value, true)

  assert.is(el.attributes?.[3]?.key, 'qux')

  assert.is(el.attributes?.[3]?.type, tokenTypes.variable)

  assert.is(el.attributes?.[3]?.value, 0)

  assert.is(el.attributes?.[4]?.key, false)

  assert.is(el.attributes?.[4]?.type, tokenTypes.variable)

  assert.is(el.attributes?.[4]?.value, 1)
})
