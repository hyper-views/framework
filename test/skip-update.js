import test from 'uvu'
import * as assert from 'uvu/assert'
import {skipUpdate} from '../main.js'

test('skip update is the object expected', () => {
  const skipped = skipUpdate()

  assert.equal(skipped.type, 'node')

  assert.equal(skipped.view, 0)

  assert.equal(skipped.dynamic, false)
})
