import test from 'ava'
import {html} from '../../main.js'

test('attributes', (t) => {
  const el = /* prettier-ignore */ html`
    <div foo bar="a" baz='b' qux=${'c'} ${{'doo': 'd'}} />
  `

  t.deepEqual(el.attributes?.length, 5)

  t.deepEqual(el.attributes?.[0]?.key, 'foo')

  t.deepEqual(el.attributes?.[0]?.value, true)

  t.deepEqual(el.attributes?.[1]?.key, 'bar')

  t.deepEqual(el.attributes?.[1]?.value, 'a')

  t.deepEqual(el.attributes?.[2]?.key, 'baz')

  t.deepEqual(el.attributes?.[2]?.value, 'b')

  t.deepEqual(el.attributes?.[3]?.key, 'qux')

  t.deepEqual(el.attributes?.[3]?.variable, true)

  t.deepEqual(el.attributes?.[3]?.value, 0)

  t.deepEqual(el.attributes?.[4]?.key, false)

  t.deepEqual(el.attributes?.[4]?.variable, true)

  t.deepEqual(el.attributes?.[4]?.value, 1)
})
