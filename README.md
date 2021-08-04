# @erickmerchant/framework

A modest frontend framework in a bit less than 3kB minified and gzipped. No build step required to use. Import it from a CDN like Skypack and get started.

## Get started

```javascript
import {
  cache
  createApp,
  createDOMView,
  html,
} from 'https://cdn.skypack.dev/@erickmerchant/framework?min'

const app = createApp({items: []})
```

`createApp` take the initial state of the app. It can be any type, but an object usually makes sense.

## Rendering some html

```javascript
const target = document.querySelector('#app')

const view = (state) => html`
  <div id="app" />
`

const domView = createDOMView(target, view)

app.render(domView)
```

This doesn't do much right now, but it does demonstrate a few things.

- How to render an element with no children. The self closing `/>` is required even on tags that normally wouldn't need it and it's allowed on all, even those that normally wouldn't allow it.
- How to render static attributes. `id="app"` is static. It will be the same each time this view is rendered. The quotes (single or double) are require.

### Dynamic children

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
`
```

This shows how you can have dynamic children and how you'd output an array of items.

### Cached children

Sometimes you'll have something that needs to be dynamic once but after that can be treated as if it were static. That's where `cache` comes into play.

```javascript
const title = 'Cool list making app'

const heading = cache(
  html`
    <h1>${title}</h1>
  `
)

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
`
```

### Properties

### Events

## Changing state

## Server-side rendering

## Example

```javascript
import {
  createApp,
  createDOMView,
  html
} from 'https://cdn.skypack.dev/@erickmerchant/framework?min'

const app = createApp(0)

const decrement = () => {
  app.state--
}

const increment = () => {
  app.state++
}

const target = document.querySelector('div')

const view = createDOMView(
  target,
  (state) => html`
    <div>
      <output>${state}</output>
      <br />
      <button type="button" @click=${decrement}>--</button>
      <button type="button" @click=${increment}>++</button>
    </div>
  `
)

app.render(view)
```
