# @erickmerchant/framework

## Example

```javascript
import {createApp, createDomView, html} from '@erickmerchant/framework'

const app = createApp(0)

const decrement = () => {
  app.commit((current) => current - 1)
}

const increment = () => {
  app.commit((current) => current + 1)
}

const view = createDomView(document.querySelector('main'), (state) => {
  return html`
    <main>
      <output>${state}</output>
      <br />
      <button type="button" onclick=${decrement}>--</button>
      <button type="button" onclick=${increment}>++</button>
    </main>
  `
})

app.render(view)
```
