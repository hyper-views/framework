export const createApp = (state) => {
  let viewCalled = false
  let view

  const callView = () => {
    viewCalled = false

    return Promise.resolve().then(() => {
      if (!viewCalled && view) {
        viewCalled = true

        view(get())

        viewCalled = false
      }
    })
  }

  const proxy = new Proxy(
    {},
    {
      set(_, key, val) {
        if (viewCalled) return false

        state[key] = val

        callView()

        return true
      },
      get(_, key) {
        return state[key]
      }
    }
  )

  const get = () => (typeof state === 'object' ? proxy : state)

  return {
    render(v) {
      view = v

      callView()
    },
    set state(val) {
      if (val !== proxy) {
        state = val
      }

      callView()
    },
    get state() {
      return get()
    }
  }
}
