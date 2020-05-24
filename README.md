# @erickmerchant/framework

## Example

``` javascript
import {createApp, createDomView, html} from '@erickmerchant/framework'

const app = createApp(0)

const view = createDomView(document.querySelector('main'), (state) => {
  return html`<main>
    <output>${state}</output>
    <br />
    <button
      onclick=${() => {
        app.commit((current) => current - 1)
      }}
    >--</button>
    <button
      onclick=${() => {
        app.commit((current) => current + 1)
      }}
    >++</button>
  </main>`
})

app.render(view)
```
