import {test} from 'uvu'
import * as assert from 'uvu/assert'

import {skipUpdate} from '../main.js'

test('skip update is the object expected', () => {
  const skipped = skipUpdate()

  assert.is(skipped.type, 'node')

  assert.is(skipped.view, 0)

  assert.is(skipped.dynamic, false)
})
