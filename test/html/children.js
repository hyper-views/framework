import test from 'ava'
import {html} from '../../main.js'

test('nodes -- static and dynamic', (t) => {
  const el = html`
    <ul>
      <li>0</li>
      <li>${1}</li>
      <li><span>2</span></li>
    </ul>
  `

  t.deepEqual(el.type, 'node')

  t.deepEqual(el.tag, 'ul')

  t.deepEqual(el.dynamic, true)

  t.deepEqual(el.children?.length, 3)

  t.deepEqual(el.children?.[0]?.type, 'node')

  t.deepEqual(el.children?.[0]?.tag, 'li')

  t.deepEqual(el.children?.[0]?.dynamic, false)

  t.deepEqual(el.children?.[0]?.children?.length, 1)

  t.deepEqual(el.children?.[0]?.children?.[0]?.type, 'text')

  t.deepEqual(el.children?.[0]?.children?.[0]?.value, '0')

  t.deepEqual(el.children?.[1]?.type, 'node')

  t.deepEqual(el.children?.[1]?.tag, 'li')

  t.deepEqual(el.children?.[1]?.dynamic, true)

  t.deepEqual(el.children?.[1]?.children?.length, 1)

  t.deepEqual(el.children?.[1]?.children?.[0]?.type, 'variable')

  t.deepEqual(el.children?.[1]?.children?.[0]?.variable, true)

  t.deepEqual(el.children?.[1]?.children?.[0]?.value, 0)

  t.deepEqual(el.children?.[2]?.type, 'node')

  t.deepEqual(el.children?.[2]?.tag, 'li')

  t.deepEqual(el.children?.[2]?.dynamic, false)

  t.deepEqual(el.children?.[2]?.children?.length, 1)

  t.deepEqual(el.children?.[2]?.children?.[0]?.type, 'node')

  t.deepEqual(el.children?.[2]?.children?.[0]?.tag, 'span')

  t.deepEqual(el.children?.[2]?.children?.[0]?.dynamic, false)

  t.deepEqual(el.children?.[2]?.children?.[0]?.children?.length, 1)

  t.deepEqual(el.children?.[2]?.children?.[0]?.children?.[0]?.type, 'text')

  t.deepEqual(el.children?.[2]?.children?.[0]?.children?.[0]?.value, '2')
})
