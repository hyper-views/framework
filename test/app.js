import t from 'tap';

import {createApp} from '../app.js';

t.test('app is created and responds to state changes', async () => {
  const app = createApp(0);

  app.render((state) => {
    t.equal(state, 2);
  });

  app.state = 1;

  app.state++;
});
