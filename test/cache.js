import t from 'tap';

import {cache, html} from '../html.js';

t.test('cache', async () => {
  t.match(cache({test: 1}), {test: 1, dynamic: false});

  html.dev = true;

  t.match(cache({test: 2}), {test: 2});
});
