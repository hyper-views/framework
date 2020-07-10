import test from 'uvu'
import * as assert from 'uvu/assert'
import {html} from '../../main.js'

test('attributes', () => {
  const el = /* prettier-ignore */ html`
    <div foo bar="a" baz='b' qux=${'c'} ${{'doo': 'd'}} />
  `

  assert.equal(el.attributes?.length, 5)

  assert.equal(el.attributes?.[0]?.key, 'foo')

  assert.equal(el.attributes?.[0]?.value, true)

  assert.equal(el.attributes?.[1]?.key, 'bar')

  assert.equal(el.attributes?.[1]?.value, 'a')

  assert.equal(el.attributes?.[2]?.key, 'baz')

  assert.equal(el.attributes?.[2]?.value, 'b')

  assert.equal(el.attributes?.[3]?.key, 'qux')

  assert.equal(el.attributes?.[3]?.variable, true)

  assert.equal(el.attributes?.[3]?.value, 0)

  assert.equal(el.attributes?.[4]?.key, false)

  assert.equal(el.attributes?.[4]?.variable, true)

  assert.equal(el.attributes?.[4]?.value, 1)
})
