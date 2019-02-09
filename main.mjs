export {default as domUpdate} from './dom-update.mjs'

export {default as html, safe} from './html.mjs'

export default ({state, component, update}) => {
  const commit = (produce) => {
    state = produce(state)

    update(component(state, commit))
  }

  commit((state) => state)
}
