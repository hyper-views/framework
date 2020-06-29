import test from 'ava'
import {html} from '../../main.js'

test('handles self closing and not', (t) => {
  const div1 = html`
    <div />
  `

  t.deepEqual(div1.type, 'node')

  t.deepEqual(div1.tag, 'div')

  t.deepEqual(div1.dynamic, false)

  const div2 = html`
    <div></div>
  `

  t.deepEqual(div2.type, 'node')

  t.deepEqual(div2.tag, 'div')

  t.deepEqual(div2.dynamic, false)
})
