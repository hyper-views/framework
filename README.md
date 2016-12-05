# @erickmerchant/framework

This scoped package is my personal framework.

I wrote it to understand how modern javascript frameworks do things. It's greatly inspired by React and Redux, etc, obviously. Also hyperx, which demonstrated that you can use tagged template strings instead of JSX, was a huge inspiration.

I also wrote it because I don't really like any of the options out there. They're all too complicated in my opinion.

It is meant to be used with browserify.

## An Example

This example uses diffhtml, but you should be able to use an alternative that provides something with the same functionality of its innerHTML.

``` javascript
const framework = require('@erickmerchant/framework')
const diffhtml = require('diffhtml')
const diff = diffhtml.innerHTML
const html = diffhtml.html
const target = document.querySelector('main')

framework({target, store, component, diff})(init)

function init ({dispatch}) {
  dispatch('increment')
}

function store (state = 0, action) {
  if (action === 'increment') state = state + 1
  if (action === 'decrement') state = state - 1

  return state
}

function component (href) {
  return function ({state, dispatch}) {
    return html`<p>
      <button onclick='${decrement}'>-</button>
      <strong>${state}</strong>
      <button onclick='${increment}'>+</button>
    </p>`

    function decrement () {
      dispatch('decrement')
    }

    function increment () {
      dispatch('increment')
    }
  }
}
```

## API Reference

### Framework Code

#### framework

_framework({target, store, component, diff, raf})_

- target: a DOM element. The place to render your application
- store: a function. See [store](#store)
- component: a function. See [component](#component)
- diff: a function. See [diff](#diff)
- raf: optional. A function. A replacement for window.requestAnimationFrame. It defaults to window.requestAnimationFrame

Returns a function. See [init](#init)

#### state

This is what is returned from the [store](#store). It can be anything from simply a number like in the example, to a complex object.

#### dispatch

_dispatch(...arguments)_

Initializes a change in state and causes a render

- arguments: all get passed to the store

#### show

_show(href)_

- href: the window.location will get updated with this and a render will happen

#### next

_next(callback)_

A convenient helper to pass a callback to process.nextTick. Can be used to manipulate the page in some way after a render. For example scrolling to a specific element

- callback: see [next callback](#next-callback)

#### next callback

_callback(target)_

- target: the [target](#target)

#### init

_init(callback)_

- callback: see [init callback](#init-callback)

### Application Code

#### store

_store(state, ...arguments)_

Called initially with zero arguments, it should return the default/initial state.

- state: the previous thing returned from calling store
- arguments: all the arguments passed to [dispatch](#dispatch)

#### component

_component(href)_

- href: the current url

Returns the [component callback](#component-callback)

#### component callback

_callback({state, dispatch, show, next})_

- state: the current [state](#state)
- dispatch: the [dispatch](#dispatch) function
- show: a function. See [show](#show)
- next: a function. See [next](#next)

Should return the element to pass to [diff](#diff)

#### diff

_diff(target, element)_

- target: the target that the application is passed
- element: the new element returned from the [component callback](#component-callback)

#### init callback

_callback({state, dispatch})_

- state: the [state](#state)
- dispatch: see [dispatch](#dispatch)

## Related Projects

- [@erickmerchant/state-container](https://github.com/erickmerchant/state-container)

  A state container to use as a store

- [@erickmerchant/router](https://github.com/erickmerchant/router)

  A router to use as a component

- [A TodoMVC example](http://todo.erickmerchant.com)

  The source code can be found [here](https://github.com/erickmerchant/framework-todo)
