import test from 'uvu'
import * as assert from 'uvu/assert'
import {createApp} from '../main.js'

test('app is created and responds to state changes', async () => {
  const expectedValues = [null, 1, 2, 2, undefined]

  const app = createApp(null)

  await app.render((state) => {
    assert.equal(state, expectedValues.shift())

    return true
  })

  app.commit(1)

  app.commit((state) => state + 1)

  app.commit(() => {})

  app.commit()

  assert.equal(expectedValues.length, 0)
})
