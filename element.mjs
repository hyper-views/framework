import {domUpdate} from './dom-update.mjs'
import {view} from './view.mjs'

export const element = (tag, definition) => {
  definition.attributes = definition.attributes || []

  customElements.define(
    tag,
    class extends HTMLElement {
      static get observedAttributes() { return definition.attributes }

      constructor() {
        super()

        const root = this.attachShadow({mode: 'open'})

        this.view = view()

        const firstRender = definition.render(this.getObservedAttributes(), this.view)

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

            this.update(definition.render(this.getObservedAttributes(), this.view))
          }, 0)
        }
      }

      getObservedAttributes() {
        const attributes = {}

        for (const key of definition.attributes) {
          attributes[key] = this.getAttribute(key)
        }

        return attributes
      }

      disconnectedCallback () {
        if (definition.disconnected != null) {
          definition.disconnected.call(this)
        }
      }

      connectedCallback () {
        if (definition.connected != null) {
          definition.connected.call(this)
        }
      }
    }
  )
}

