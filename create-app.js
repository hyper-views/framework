export const createApp = (state) => {
  let callingView = false
  let willCallView = false
  let view

  const callView = () => {
    if (willCallView) return

    willCallView = true

    Promise.resolve().then(() => {
      willCallView = false

      if (!callingView && view) {
        callingView = true

        view(get())

        callingView = false
      }
    })
  }

  const proxy = new Proxy(
    {},
    {
      set(_, key, val) {
        if (callingView) return false

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
