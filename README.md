# @erickmerchant/framework

This scoped package is my personal framework. I use it on a number of small projects.

## An Example

``` javascript
const framework = require('@erickmerchant/framework')
const { main, output, br, button } = require('@erickmerchant/framework/html')
const update = require('@erickmerchant/framework/update')(document.querySelector('main'))

framework({store, component, update})

function store (commit) {
  commit(() => 0)

  return (action) => {
    commit((state) => {
      switch (action) {
        case 'increment':
        return state + 1

        case 'decrement':
        return state - 1
      }
    })
  }
}

function component ({state, dispatch}) {
  return main(
    output(state),
    br(),
    button({ onclick () { dispatch('decrement') } }, '--'),
    button({ onclick () { dispatch('increment') } }, '++')
  )
}
```

## Related Projects

- [@erickmerchant/router](https://github.com/erickmerchant/router)

  A module to do routing inside your components.

- [A TodoMVC example](https://todo.erickmerchant.com)

  The source code can be found [here](https://github.com/erickmerchant/framework-todo)
