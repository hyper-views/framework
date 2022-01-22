import {morph} from './morph.js';

const shadows = new WeakMap();

export const render = (component) => {
  const result = component.template();

  const shadow = shadows.get(component);

  morph(shadow, result, {rootNode: shadow});
};

export const register = (Definition, win = window) => {
  const attributes = Definition.attributes ?? [];

  class Element extends win.HTMLElement {
    static get observedAttributes() {
      return attributes;
    }

    connectedCallback() {
      this.component = new Definition(this);

      this.component.attributes = {};

      for (const name of attributes) {
        this.component.attributes[name] = this.getAttribute(name);
      }

      this.attachShadow({mode: 'open'});

      shadows.set(this.component, this.shadowRoot);

      render(this.component);
    }

    attributeChangedCallback(name, _, newValue) {
      if (this.shadowRoot) {
        this.component.attributes[name] = newValue;

        render(this.component);
      }
    }
  }

  win.customElements.define(Definition.tag, Element);
};
