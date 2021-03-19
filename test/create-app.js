import {test} from 'uvu'
import * as assert from 'uvu/assert'
import {createApp} from '../main.js'

test('app is created and responds to state changes', async () => {
  const app = createApp(0)

  app.render((state) => {
    assert.is(state, 2)
  })

  app.state = 1

  app.state++
})
