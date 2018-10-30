# @erickmerchant/framework

This scoped package is my personal framework. I use it on a number of small projects.

## An Example

``` javascript
const framework = require('@erickmerchant/framework')
const { main, output, br, button } = require('@erickmerchant/framework/html')
const update = require('@erickmerchant/framework/update')(document.querySelector('main'))

framework({store, component, update})()

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


## API Reference

#### framework

_framework({store, component, update})_

The function exported by this module.

- [store](#store)
- [component](#component)
- [update](#update)

Returns a function. See [dispatch](#dispatch)

#### state

This is what is passed to [commit](#commit). It can be anything from simply a number like in the example, but a plain object makes sense in most cases.

#### commit

_commit((current) => next)_

It's passed a callback that receives the current state and should return the new state.

- [current](#state): the current state
- [next](#next): the next state

#### store

_store(commit)_

It should return a function (see [dispatch](#dispatch)).

- [commit](#commit)

#### dispatch

_dispatch(...arguments)_

Initializes a change in state and causes a render.

- arguments: anything

#### component

_component({state, dispatch})_

- [state](#state)
- [dispatch](#dispatch)

Should return the element to pass to [update](#update)

#### update

_update(element)_

- element: the new element returned from the [component](#component)


## Related Projects

- [@erickmerchant/router](https://github.com/erickmerchant/router)

  A module to do routing inside your components.

- [A TodoMVC example](https://todo.erickmerchant.com)

  The source code can be found [here](https://github.com/erickmerchant/framework-todo)
