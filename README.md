# @erickmerchant/framework

This scoped package is my personal framework. I use it on a number of small projects.

## An Example

``` javascript
import framework, {html, domUpdate} from '@erickmerchant/framework'

const update = domUpdate(document.querySelector('main'))
const { main, output, br, button } = html
const initial = 0

framework({component, update})

function component (state, commit) {
  return main({},
    output({}, state),
    br({}),
    button({
      onclick () {
        commit((current = initial) => current - 1)
      }
    }, '--'),
    button({
      onclick () {
        commit((current = initial) => current + 1)
      }
    }, '++')
  )
}
```

## Related Projects

- [@erickmerchant/router](https://github.com/erickmerchant/router)

  A module to do routing inside your components.

- [A TodoMVC example](https://todo.erickmerchant.com)

  The source code can be found [here](https://github.com/erickmerchant/framework-todo)
