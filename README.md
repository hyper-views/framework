# @hyper-views/framework

A simple front-end framework.

## Get started

```javascript
import {morph, html} from '@hyper-views/framework';

const target = document.querySelector('#app');

const cls = 'app';

const view = () => html`
  <div id="app" class=${cls} />
`;

morph(target, view());
```

This doesn't do much right now, but it does demonstrate a few things.

- How to render an element with no children. The self closing `/>` is required even on tags that normally wouldn't need it and it's allowed on all, even those that normally wouldn't allow it.
- How to render static attributes. `id="app"` is static. It will be the same each time this view is rendered. The quotes (single or double) are require.
- How to render variable attributes. `class=${cls}` is an variable attribute.

## Dynamic children

```javascript
const view = (state) => html`
  <div id="app">
    <ol>
      ${state.items.map(
        (item) =>
          html`
            <li>${item}</li>
          `
      )}
    </ol>
  </div>
`;
```

This shows how you can have dynamic children and how you'd output an array of items.

## Cached elements

Sometimes you'll have some html that needs to be dynamic once but after that can be treated as if it were static. That's where `cache` comes into play.

```javascript
import {cache, html} from '@hyper-views/framework';

const title = 'The heading';

const heading = cache(
  html`
    <h1>${title}</h1>
  `
);

const view = (state) => html`
  <div id="app">
    ${heading}
    <ol>
      ${state.items.map(
        (item) =>
          html`
            <li>${item}</li>
          `
      )}
    </ol>
  </div>
`;
```

## Properties

Sometimes you need to change properties, not attributes, especially with form elements and web components. You can indicate a property with `:`, a single colon.

```javascript
let hasFoo = true;

let barValue = "I'm the bar value";

const view = (state) => html`
  <form id="app">
    <label>
      Has foo
      <input type="checkbox" :checked=${hasFoo} />
    </label>
    <label>
      Bar value
      <input type="text" :value=${barValue} />
    </label>
  </form>
`;
```

Also worth pointing out in this example is that `hasFoo` is a boolean, which demonstrates how to render boolean properties.

## Events

```javascript
const onClick = (e) => {
  e.preventDefault();
};

const view = (state) => html`
  <div id="app">
    <button @click=${onClick}>Click here</button>
  </div>
`;
```

The framework always uses event delegation. For instance with this click handler above a single event handler is added to the document with capture set to true. When a click occurs the target is checked to see if it was registered as having a handler. If it was then the handler is called with the event object.

## Changing state

```javascript
const state = {count: 0};
const target = document.querySelector('#app');

const onClick = (e) => {
  e.preventDefault();

  state.count++;

  morph(target, view(state));
};

const view = (state) => html`
  <div id="app">
    <p>${state.count}</p>
    <button @click=${onClick}>Click here</button>
  </div>
`;

morph(target, view(state));
```

## Server-side rendering

```javascript
import {stringify, html} from '@hyper-views/framework/stringify.js';

const view = (state) => html`
  <div id="app">
    <ol>
      ${state.items.map(
        (item) =>
          html`
            <li>${item}</li>
          `
      )}
    </ol>
  </div>
`;

const staticHTML = stringify(view({items}));

res.write(staticHTML);
```
