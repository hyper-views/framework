import {test} from 'uvu'
import * as assert from 'uvu/assert'
import {html} from '../../main.js'

test('text nodes -- static and dynamic', () => {
  const el1 = /* prettier-ignore */ html`
    <div> 0 ${1} </div>
  `

  assert.is(el1.type, 'node')

  assert.is(el1.tag, 'div')

  assert.is(el1.dynamic, true)

  assert.is(el1.children?.length, 2)

  assert.is(el1.children?.[0]?.type, 'text')

  assert.is(el1.children?.[0]?.value, ' 0 ')

  assert.is(el1.children?.[1]?.type, 'variable')

  assert.is(el1.children?.[1]?.variable, true)

  assert.is(el1.children?.[1]?.value, 0)

  const el2 = /* prettier-ignore */ html`
    <div> ${0} 1 </div>
  `

  assert.is(el2.type, 'node')

  assert.is(el2.tag, 'div')

  assert.is(el2.dynamic, true)

  assert.is(el2.children?.length, 2)

  assert.is(el2.children?.[0]?.type, 'variable')

  assert.is(el2.children?.[0]?.variable, true)

  assert.is(el2.children?.[0]?.value, 0)

  assert.is(el2.children?.[1]?.type, 'text')

  assert.is(el2.children?.[1]?.value, ' 1 ')

  const el3 = /* prettier-ignore */ html`
    <div> ${0} ${1} </div>
  `

  assert.is(el3.type, 'node')

  assert.is(el3.tag, 'div')

  assert.is(el3.dynamic, true)

  assert.is(el3.children?.length, 3)

  assert.is(el3.children?.[0]?.type, 'variable')

  assert.is(el3.children?.[0]?.variable, true)

  assert.is(el3.children?.[0]?.value, 0)

  assert.is(el3.children?.[1]?.type, 'text')

  assert.is(el3.children?.[1]?.value, ' ')

  assert.is(el3.children?.[2]?.type, 'variable')

  assert.is(el3.children?.[2]?.variable, true)

  assert.is(el3.children?.[2]?.value, 1)
})
