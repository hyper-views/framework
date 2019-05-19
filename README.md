# @erickmerchant/framework

## An Example

``` javascript
import framework, {view, domUpdate} from '@erickmerchant/framework'

const update = domUpdate(document.querySelector('main'))
const { app } = view
const state = 0

framework({
  state,
  update,
  component: (state, commit) => app`<main>
    <output>${state}</output>
    <br />
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
})
```

## See Also

- [@erickmerchant/router](https://github.com/erickmerchant/router)

  A module to do routing inside your components.

- [@erickmerchant/onappend](https://github.com/erickmerchant/onappend)

  Uses a MutationObserver to call onappend and onremove events on elements.

- [A TodoMVC example](https://todo.erickmerchant.com)

  The source code can be found [here](https://github.com/erickmerchant/framework-todo)
