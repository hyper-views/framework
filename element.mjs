import {domUpdate} from './dom-update.mjs'
import {view} from './view.mjs'

export const element = (tag, definition) => {
  let attributes = []
  let connected
  let disconnected

  const render = definition({
    view: view(),
    attributes (...attrs) {
      attributes.push(...attrs)
    },
    connected (cb) {
      connected = cb
    },
    disconnected (cb) {
      disconnected = cb
    }
  })

  customElements.define(
    tag,
    class extends HTMLElement {
      static get observedAttributes() { return attributes }

      constructor() {
        super()

        const root = this.attachShadow({mode: 'open'})

        const firstRender = render(this.getObservedAttributes(), this.view)

        const firstChild = document.createElement(firstRender.tree.tag)

        root.appendChild(firstChild)

        this.update = domUpdate(firstChild)

        this.update(firstRender)

        this.willUpdate = false
      }

      attributeChangedCallback() {
        if (this.willUpdate === false) {
          this.willUpdate = true

          setTimeout(() => {
            this.willUpdate = false

            this.update(render(this.getObservedAttributes(), this.view))
          }, 0)
        }
      }

      getObservedAttributes() {
        const observed = {}

        for (const key of attributes) {
          observed[key] = this.getAttribute(key)
        }

        return observed
      }

      disconnectedCallback() {
        if (disconnected != null) {
          disconnected.call(this)
        }
      }

      connectedCallback() {
        if (connected != null) {
          connected.call(this)
        }
      }
    }
  )
}
