import {cache, html} from './html.js';
import {morph} from './morph.js';

const definitions = new Map();

class Element extends HTMLElement {
  connectedCallback() {
    const Definition = definitions.get(this.tagName.toLowerCase());

    this.component = new Definition(this);

    if (Definition.attributes) {
      for (const name of Definition.attributes) {
        this.component.attributes[name] = this.getAttribute(name);
      }
    }

    this.shadow = this.attachShadow({mode: 'open'});

    render(this.component);
  }

  attributeChangedCallback(name, _, newValue) {
    if (this.shadow) {
      this.component.attributes[name] = newValue;

      render(this.component);
    }
  }
}

const createElement = (attributes) =>
  class extends Element {
    static get observedAttributes() {
      return attributes;
    }
  };

const mixDefinition = (Definition) =>
  class extends Definition {
    constructor(host) {
      super(host);

      this.host = host;

      this.attributes = {};
    }
  };

export const render = (self) => {
  const result = self.template();

  morph(self.host.shadow, result, {rootNode: self.host.shadow});
};

export const register = (Definition) => {
  definitions.set(Definition.tag, mixDefinition(Definition));

  window.customElements.define(
    Definition.tag,
    createElement(Definition.attributes)
  );
};
