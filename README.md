# @erickmerchant/framework

A simple frontend framework.

## Get started

```js
import {
  cache
  createApp,
  createDOMView,
  html,
} from 'https://cdn.skypack.dev/@erickmerchant/framework?min'

const app = createApp({items: []})
```

`createApp` takes the initial state of the app. It can be any type, but an object usually makes sense.

## Rendering some html

```js
const target = document.querySelector('#app')

const cls = getCls()

const view = (state) => html`
  <div id="app" class=${cls} />
`

const domView = createDOMView(target, view)

app.render(domView)
```

This doesn't do much right now, but it does demonstrate a few things.

- How to render an element with no children. The self closing `/>` is required even on tags that normally wouldn't need it and it's allowed on all, even those that normally wouldn't allow it.
- How to render static attributes. `id="app"` is static. It will be the same each time this view is rendered. The quotes (single or double) are require.
- How to render cached attributes. `class=${cls}` is cached. Its value is not hard-coded. However every time the view is rendered it will not change, even if `getCls()` returns a new value.

## Dynamic children

```js
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

## Cached children

Sometimes you'll have some html that needs to be dynamic once but after that can be treated as if it were static. That's where `cache` comes into play.

```js
const title = 'The heading'

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

## Properties

Cached attributes are useful, but often you'll have attributes that need to change. This is where you can use properties instead. Properties are always reevaluated. You can indicate a property with `:`, a single colon.

```js
let hasFoo = true

let barValue = "I'm the bar value"

const view = (state) => html`
  <form id="app">
    <label>
      Has foo
      <input type="checkbox" :checkbox=${hasFoo} />
    </label>
    <label>
      Bar value
      <input type="text" :value=${barValue} />
    </label>
  </form>
`
```

Also worth pointing out in this example is that `hasFoo` is a boolean, which demonstrates how to render boolean properties.

## Events

```js
const onClick = (e) => {
  e.preventDefault()
}

const view = (state) => html`
  <div id="app">
    <button @click=${onClick}>Click here</button>
  </div>
`
```

## Changing state

```js
const onClick = (e) => {
  e.preventDefault()

  app.state = {count: app.state.count + 1}
}

const view = (state) => html`
  <div id="app">
    <p>${state.count}</p>
    <button @click=${onClick}>Click here</button>
  </div>
`
```

## Server-side rendering

```js
import {stringify, html} from '@erickmerchant/framework/stringify.js'

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

const staticHTML = stringify(view({items}))

res.write(staticHTML)
```
