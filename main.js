export {createDomView} from './create-dom-view.js'

export {html} from './html.js'

export {createApp} from './create-app.js'

const viewZero = {
  type: 'node',
  view: 0,
  dynamic: false
}

export const skipUpdate = () => viewZero
