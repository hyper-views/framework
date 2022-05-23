import t from 'tap';

import {cache} from '../main.js';

t.test('cache', async () => {
  t.match(cache({children: [{view: 1}]}), {
    children: [{view: 1, dynamic: false}],
  });
});
