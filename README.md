# @erickmerchant/framework

## An Example

``` javascript
import framework, {html, domUpdate} from '@erickmerchant/framework'

const update = domUpdate(document.querySelector('main'))
const { main, output, br, button } = html
const state = 0

framework({
  state,
  update,
  component (state, commit) {
    return main({},
      output({}, state),
      br({}),
      button({
        onclick () {
          commit((current) => current - 1)
        }
      }, '--'),
      button({
        onclick () {
          commit((current) => current + 1)
        }
      }, '++')
    )
  }
})
```

## See Also

- [@erickmerchant/router](https://github.com/erickmerchant/router)

  A module to do routing inside your components.

- [@erickmerchant/onappend](https://github.com/erickmerchant/onappend)

  Uses a MutationObserver to call onappend and onremove events on elements.

- [A TodoMVC example](https://todo.erickmerchant.com)

  The source code can be found [here](https://github.com/erickmerchant/framework-todo)
