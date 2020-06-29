import test from 'ava'
import {createApp} from '../main.js'

test('app is created and responds to state changes', async (t) => {
  const expectedValues = [null, 1, 2, 2, undefined]

  const app = createApp(null)

  await app.render((state) => {
    t.deepEqual(state, expectedValues.shift())

    return true
  })

  app.commit(1)

  app.commit((state) => state + 1)

  app.commit(() => {})

  app.commit()

  t.deepEqual(expectedValues.length, 0)
})
