/* global window */

export default ({component, update, raf}) => {
  raf = raf != null ? raf : window.requestAnimationFrame

  let rafCalled = false

  let state = null

  const render = () => {
    rafCalled = false

    update(component({state, commit}))
  }

  const commit = (produce) => {
    if (produce != null) {
      state = produce(state)
    }

    if (!rafCalled) {
      rafCalled = true

      raf(render)
    }
  }

  return commit
}
