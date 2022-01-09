import t from 'tap';

import {cache} from '../html.js';

t.test('cache', async () => {
  t.match(cache({test: 1}), {test: 1, dynamic: false});
});
