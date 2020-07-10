import test from 'uvu'
import * as assert from 'uvu/assert'
import {html} from '../../main.js'

test('text nodes -- static and dynamic', () => {
  const el1 = /* prettier-ignore */ html`
    <div> 0 ${1} </div>
  `

  assert.equal(el1.type, 'node')

  assert.equal(el1.tag, 'div')

  assert.equal(el1.dynamic, true)

  assert.equal(el1.children?.length, 2)

  assert.equal(el1.children?.[0]?.type, 'text')

  assert.equal(el1.children?.[0]?.value, ' 0 ')

  assert.equal(el1.children?.[1]?.type, 'variable')

  assert.equal(el1.children?.[1]?.variable, true)

  assert.equal(el1.children?.[1]?.value, 0)

  const el2 = /* prettier-ignore */ html`
    <div> ${0} 1 </div>
  `

  assert.equal(el2.type, 'node')

  assert.equal(el2.tag, 'div')

  assert.equal(el2.dynamic, true)

  assert.equal(el2.children?.length, 2)

  assert.equal(el2.children?.[0]?.type, 'variable')

  assert.equal(el2.children?.[0]?.variable, true)

  assert.equal(el2.children?.[0]?.value, 0)

  assert.equal(el2.children?.[1]?.type, 'text')

  assert.equal(el2.children?.[1]?.value, ' 1 ')

  const el3 = /* prettier-ignore */ html`
    <div> ${0} ${1} </div>
  `

  assert.equal(el3.type, 'node')

  assert.equal(el3.tag, 'div')

  assert.equal(el3.dynamic, true)

  assert.equal(el3.children?.length, 3)

  assert.equal(el3.children?.[0]?.type, 'variable')

  assert.equal(el3.children?.[0]?.variable, true)

  assert.equal(el3.children?.[0]?.value, 0)

  assert.equal(el3.children?.[1]?.type, 'text')

  assert.equal(el3.children?.[1]?.value, ' ')

  assert.equal(el3.children?.[2]?.type, 'variable')

  assert.equal(el3.children?.[2]?.variable, true)

  assert.equal(el3.children?.[2]?.value, 1)
})
