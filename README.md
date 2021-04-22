# @erickmerchant/framework

A very simple framework in a bit less than 3kB minified + gzipped. No build step required to use. Import it from a cdn like skypack and get started.

## Example

```javascript
import {
  createApp,
  createDomView,
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

const view = createDomView(
  target,
  (state) => html`
    <div>
      <output>${state}</output>
      <br />
      <button type="button" onclick=${decrement}>--</button>
      <button type="button" onclick=${increment}>++</button>
    </div>
  `
)

app.render(view)
```
