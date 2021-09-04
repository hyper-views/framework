export const createApp = (state) => {
  let willCallView = false
  const views = []

  const callView = () => {
    if (willCallView) return

    willCallView = true

    Promise.resolve().then(() => {
      willCallView = false

      for (const view of views) view(state)
    })
  }

  return {
    render(v) {
      views.push(v)

      callView()
    },
    set state(val) {
      state = val

      callView()
    },
    get state() {
      return state
    }
  }
}
