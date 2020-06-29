import test from 'ava'
import {html} from '../../main.js'

test('text nodes -- static and dynamic', (t) => {
  const el1 = /* prettier-ignore */ html`
    <div> 0 ${1} </div>
  `

  t.deepEqual(el1.type, 'node')

  t.deepEqual(el1.tag, 'div')

  t.deepEqual(el1.dynamic, true)

  t.deepEqual(el1.children?.length, 2)

  t.deepEqual(el1.children?.[0]?.type, 'text')

  t.deepEqual(el1.children?.[0]?.value, ' 0 ')

  t.deepEqual(el1.children?.[1]?.type, 'variable')

  t.deepEqual(el1.children?.[1]?.variable, true)

  t.deepEqual(el1.children?.[1]?.value, 0)

  const el2 = /* prettier-ignore */ html`
    <div> ${0} 1 </div>
  `

  t.deepEqual(el2.type, 'node')

  t.deepEqual(el2.tag, 'div')

  t.deepEqual(el2.dynamic, true)

  t.deepEqual(el2.children?.length, 2)

  t.deepEqual(el2.children?.[0]?.type, 'variable')

  t.deepEqual(el2.children?.[0]?.variable, true)

  t.deepEqual(el2.children?.[0]?.value, 0)

  t.deepEqual(el2.children?.[1]?.type, 'text')

  t.deepEqual(el2.children?.[1]?.value, ' 1 ')

  const el3 = /* prettier-ignore */ html`
    <div> ${0} ${1} </div>
  `

  t.deepEqual(el3.type, 'node')

  t.deepEqual(el3.tag, 'div')

  t.deepEqual(el3.dynamic, true)

  t.deepEqual(el3.children?.length, 3)

  t.deepEqual(el3.children?.[0]?.type, 'variable')

  t.deepEqual(el3.children?.[0]?.variable, true)

  t.deepEqual(el3.children?.[0]?.value, 0)

  t.deepEqual(el3.children?.[1]?.type, 'text')

  t.deepEqual(el3.children?.[1]?.value, ' ')

  t.deepEqual(el3.children?.[2]?.type, 'variable')

  t.deepEqual(el3.children?.[2]?.variable, true)

  t.deepEqual(el3.children?.[2]?.value, 1)
})
