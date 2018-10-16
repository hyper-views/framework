# @erickmerchant/framework

This scoped package is my personal framework. I use it on a number of small projects.

## An Example

This example uses nanohtml with nanomorph, but you should be able to use diffHTML and possibly other solutions.

``` javascript
const framework = require('@erickmerchant/framework')
const html = require('nanohtml')
const diff = require('nanomorph')
const target = document.querySelector('main')

framework({target, store, component, diff})()

function store (commit) {
  commit(() => 0)

  return (action) => {
    switch (action) {
      case 'increment':
      commit((state) => state + 1)
      break

      case 'decrement':
      commit((state) => state - 1)
      break
    }
  }
}

function component ({state, dispatch}) {
  return html`<main>
    <output>${state}</output>
    <br>
    <button onclick=${() => dispatch('decrement')}>--</button>
    <button onclick=${() => dispatch('increment')}>++</button>
  </main>`
}
```


## API Reference

### Framework Code

#### framework

_framework({target, store, component, diff, raf})_

The function exported by this module.

- target: a DOM element. The place to render your application
- [store](#store)
- [component](#component)
- [diff](#diff)
- raf: optional. A replacement for window.requestAnimationFrame. It defaults to window.requestAnimationFrame

Returns a function. See [init](#init)

#### state

This is what is passed to [commit](#commit). It can be anything from simply a number like in the example, but a plain object makes sense in most cases.

#### commit

_commit((current) => next)_

It's passed a callback that receives the current state and should return the new state.

- [current](#state): the current state
- [next](#next): the next state

#### next

_next((target) => { ... })_

A convenient helper to pass a callback to process.nextTick. Can be used to manipulate the page in some way after a render. For example scrolling to a specific element or focusing an input element.

- target: the target passed to [framework](#framework)

#### init

_init((dispatch) => { ... })_

Call init to do some initial work that may require dispatch.

- [dispatch](#dispatch)

### Application Code

#### store

_store(commit)_

It should return a function (see [dispatch](#dispatch)).

- [commit](#commit)

#### dispatch

_dispatch(...arguments)_

Initializes a change in state and causes a render.

- arguments: anything

#### component

_component({state, dispatch, next})_

- [state](#state)
- [dispatch](#dispatch)
- [next](#next)

Should return the element to pass to [diff](#diff)

#### diff

_diff(target, element)_

- target: the target passed to [framework](#framework)
- element: the new element returned from the [component](#component)


## Related Projects

- [@erickmerchant/router](https://github.com/erickmerchant/router)

  A module to do routing inside your components.

- [A TodoMVC example](https://todo.erickmerchant.com)

  The source code can be found [here](https://github.com/erickmerchant/framework-todo)
