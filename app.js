/* global WeakRef */

import {morph} from './morph.js';

export const createApp = (state) => {
  let willCallView = false;
  const views = new Map();

  const callView = () => {
    if (willCallView) return;

    willCallView = true;

    Promise.resolve().then(() => {
      willCallView = false;

      for (const [ref, view] of views.entries()) {
        const target = ref.deref();

        if (target) {
          morph(target, view(state));
        } else {
          views.delete(ref);
        }
      }
    });
  };

  return {
    render(view, target) {
      if (typeof target === 'string') {
        target = document.querySelector(target);
      }

      views.set(new WeakRef(target), view);

      callView();
    },
    set state(val) {
      state = val;

      callView();
    },
    get state() {
      return state;
    },
  };
};
