# @erickmerchant/framework

## Example

``` javascript
import {render, html, domUpdate} from '@erickmerchant/framework'

const state = 0

const update = domUpdate(document.querySelector('main'))

render({
  state,
  update,
  component({state, commit}) {
    return html`<main>
      <output>${state}</output>
      <br/>
      <button
        onclick=${() => {
          commit((current) => current - 1)
        }}
      >--</button>
      <button
        onclick=${() => {
          commit((current) => current + 1)
        }}
      >++</button>
    </main>`
  }
})
```
