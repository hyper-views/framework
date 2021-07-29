import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {html, tokenTypes} from '../../html.js'

test('text nodes -- static and dynamic', () => {
  const el1 = /* prettier-ignore */ html`
    <div> 0 ${1} </div>
  `

  assert.is(el1.type, tokenTypes.node)

  assert.is(el1.tag, 'div')

  assert.is(el1.dynamic, true)

  assert.is(el1.children?.length, 2)

  assert.is(el1.children?.[0]?.type, tokenTypes.text)

  assert.is(el1.children?.[0]?.value, ' 0 ')

  assert.is(el1.children?.[1]?.type, tokenTypes.variable)

  assert.is(el1.children?.[1]?.value, 0)

  const el2 = /* prettier-ignore */ html`
    <div> ${0} 1 </div>
  `

  assert.is(el2.type, tokenTypes.node)

  assert.is(el2.tag, 'div')

  assert.is(el2.dynamic, true)

  assert.is(el2.children?.length, 2)

  assert.is(el2.children?.[0]?.type, tokenTypes.variable)

  assert.is(el2.children?.[0]?.value, 0)

  assert.is(el2.children?.[1]?.type, tokenTypes.text)

  assert.is(el2.children?.[1]?.value, ' 1 ')

  const el3 = /* prettier-ignore */ html`
    <div> ${0} ${1} </div>
  `

  assert.is(el3.type, tokenTypes.node)

  assert.is(el3.tag, 'div')

  assert.is(el3.dynamic, true)

  assert.is(el3.children?.length, 2)

  assert.is(el3.children?.[0]?.type, tokenTypes.variable)

  assert.is(el3.children?.[0]?.value, 0)

  assert.is(el3.children?.[1]?.type, tokenTypes.variable)

  assert.is(el3.children?.[1]?.value, 1)
})
