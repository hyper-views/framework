# @erickmerchant/framework

## Example

``` javascript
import {render, html, domUpdate} from '@erickmerchant/framework'

const update = domUpdate(document.querySelector('main'))
const state = 0

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

## See Also

- [@erickmerchant/router](https://github.com/erickmerchant/router)

  A module to do routing inside your components.

- [A TodoMVC example](https://todo.erickmerchant.com)

  The source code can be found [here](https://github.com/erickmerchant/framework-todo)
