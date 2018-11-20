export default ({ store, component, update, raf }) => {
  raf = raf != null ? raf : window.requestAnimationFrame

  let rafCalled = false

  let state

  const dispatch = store(commit)

  return dispatch

  function commit (produce) {
    state = produce(state)

    if (!rafCalled) {
      rafCalled = true

      raf(render)
    }
  }

  function render () {
    rafCalled = false

    update(component({ state, dispatch }))
  }
}
