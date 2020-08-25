# @erickmerchant/framework

## Example

```javascript
import {createApp, createDomView, html} from 'https://unpkg.com/@erickmerchant/framework/main.js'

const app = createApp(0)

const decrement = () => {
  app.commit((current) => current - 1)
}

const increment = () => {
  app.commit((current) => current + 1)
}

const target = document.querySelector('div')

const view = createDomView(target, (state) => {
  return html`
    <div>
      <output>${state}</output>
      <br />
      <button type="button" onclick=${decrement}>--</button>
      <button type="button" onclick=${increment}>++</button>
    </div>
  `
})

app.render(view)
```
