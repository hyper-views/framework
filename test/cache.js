import t from 'tap';

import {cache} from '../main.js';

t.test('cache', async () => {
  t.match(cache({views: [{view: 1}]}), {views: [{view: 1, dynamic: false}]});
});
