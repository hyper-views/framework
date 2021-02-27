# @erickmerchant/framework

## Example

```javascript
import {createApp, createDomView, html} from 'https://unpkg.com/@erickmerchant/framework/main.js'

const app = createApp(0)

const decrement = () => {
  app.state--
}

const increment = () => {
  app.state++
}

const target = document.querySelector('div')

const view = createDomView(target, (state) => html`
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
