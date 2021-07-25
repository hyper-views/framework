export const createApp = (state) => {
  let willCallView = false
  let view

  const callView = () => {
    if (willCallView) return

    willCallView = true

    Promise.resolve().then(() => {
      willCallView = false

      if (view) {
        view(state)
      }
    })
  }

  return {
    render(v) {
      view = v

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
