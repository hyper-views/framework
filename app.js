import {morph} from './morph.js';

export const createApp = (state) => {
  let willCallView = false;
  const views = [];

  const callView = () => {
    if (willCallView) return;

    willCallView = true;

    Promise.resolve().then(() => {
      willCallView = false;

      for (const [target, view] of views) morph(target, view(state));
    });
  };

  return {
    render(view, target) {
      if (typeof target === 'string') {
        target = document.querySelector(target);
      }

      views.push([target, view]);

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
