export {domUpdate} from './dom-update.mjs'

export {view, safe} from './view.mjs'

export default ({state, component, update}) => {
  const nextQueue = []

  const next = (cb) => {
    nextQueue.push(cb)
  }

  const commit = (produce) => {
    state = produce(state)

    update(component({state, commit, next}), () => {
      while (nextQueue.length) {
        const cb = nextQueue.shift()

        setTimeout(cb, 0)
      }
    })
  }

  commit((state) => state)

  return commit
}
