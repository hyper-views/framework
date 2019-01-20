export {default as domUpdate} from './dom-update.mjs'

export {default as html} from './html.mjs'

export default ({component, update}) => {
  let state = null

  const defaultStore = (state) => state

  const commit = (store = defaultStore) => {
    state = store(state)

    update(component(state, commit))
  }

  return commit
}
