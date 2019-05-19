export {default as domUpdate} from './dom-update.mjs'

export {default as view, safe} from './view.mjs'

export default ({state, component, update}) => {
  const commit = (produce) => {
    state = produce(state)

    update(component(state, commit))
  }

  commit((state) => state)
}
