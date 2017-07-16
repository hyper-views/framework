# @erickmerchant/framework

This scoped package is my personal framework. I use it on a number of small projects.

## An Example

This example uses yo-yo (which uses hyperx), but you should be able to use diffHTML and possibly other solutions.

``` javascript
const framework = require('@erickmerchant/framework')
const html = require('yo-yo')
const diff = html.update
const target = document.querySelector('main')

framework({target, store, component, diff})()

function store (seed) {
  seed(0)

  return function (commit, action) {
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

This is what is initially passed to [seed](#seed) and subsequently returned from [commit](#commit) callbacks. It can be anything from simply a number like in the example, to a complex object.

#### seed

_seed(state|setup)_

It should be passed the initial state or a setup function

- [state](#state): the initial state
- [setup](#setup): a function to generate the initial state

_Warning: Calling seed after [init](#init) is called will throw an Error_

#### commit

_commit((current) => next)_

It's passed a callback that receives the current state and should return the new state.

- [current](#state): the current state
- [next](#state): the next state

_Warning: Calling commit before [init](#init) is called will throw an Error_

#### dispatch

_dispatch(...arguments)_

Initializes a change in state and causes a render. If the length of arguments is 0, the agent is not, but a render is triggered.

- arguments: all get passed to the [agent](#agent)

#### next

_next(({target, dispatch}) => { ... })_

A convenient helper to pass a callback to process.nextTick. Can be used to manipulate the page in some way after a render. For example scrolling to a specific element or focusing an input element.

- target: the target passed to [framework](#framework)
- [dispatch](#dispatch)

#### init

_init(({target, dispatch}) => { ... })_

Call init to mount your component. The callback is optional.

- target: the target passed to [framework](#framework)
- [dispatch](#dispatch)

### Application Code

#### store

_store(seed)_

It should return the [agent](#agent).

- [seed](#seed)

#### setup

_setup(commit)_

It should return the initial state.

- [commit](#commit)

#### agent

_agent(commit, ...arguments)_

Anything returned will be ignored

- [commit](#commit)
- arguments: all the arguments passed to [dispatch](#dispatch)

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

- [A TodoMVC example](http://todo.erickmerchant.com)

  The source code can be found [here](https://github.com/erickmerchant/framework-todo)
