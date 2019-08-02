export {domUpdate} from './dom-update.mjs'

export {view, safe} from './view.mjs'

export default ({state, component, update}) => {
  const commit = (produce) => {
    state = produce(state)

    update(component(state, commit))
  }

  commit((state) => state)
}
