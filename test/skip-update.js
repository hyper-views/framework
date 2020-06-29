import test from 'ava'
import {skipUpdate} from '../main.js'

test('skip update is the object expected', (t) => {
  const skipped = skipUpdate()

  t.deepEqual(skipped.type, 'node')

  t.deepEqual(skipped.view, 0)

  t.deepEqual(skipped.dynamic, false)
})
