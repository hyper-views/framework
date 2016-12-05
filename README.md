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

#### framework({target, store, component, diff, raf})

- target: a DOM element. The place to render your application
- store: a function. See __store__
- component: a function. See __component__
- diff: a function. See __diff__
- raf: optional. A function. A replacement for window.requestAnimationFrame. It defaults to window.requestAnimationFrame

Returns a function. See __init__

#### state

This is what is returned from the __store__. It can be anything from simply a number like in the example, to a complex object.

#### dispatch(...arguments)

Initializes a change in state and causes a render

- arguments: all get passed to the store

#### show(href)

- href: the window.location will get updated with this and a render will happen

#### next(callback)

A convenient helper to pass a callback to process.nextTick. Can be used to manipulate the page in some way after a render. For example scrolling to a specific element

- callback: see below

##### callback(target)

- target: the __target__

#### init(init)

- init: see __application code init__

### Application Code

#### store(state, ...arguments)

Called initially with zero arguments, it should return the default/initial state.

- state: the previous thing returned from calling store
- arguments: all the arguments passed to __dispatch__

#### component(href)

- href: the current url

Returns the callback (see below)

##### callback({state, dispatch, show, next})

- state: the current __state__
- dispatch: the __dispatch__ function
- show: a function. See __show__
- next: a function. See __next__

Should return the element to pass to __diff__

#### diff(target, element)

- target: the target that the application is passed
- element: the new element returned from the __component callback__

#### init({state, dispatch})

- state: the __state__
- dispatch: see __dispatch__

## Related Projects

- [@erickmerchant/state-container](https://github.com/erickmerchant/state-container)

  A state container to use as a store

- [@erickmerchant/router](https://github.com/erickmerchant/router)

  A router to use as a component

- [A TodoMVC example](http://todo.erickmerchant.com)

  The source code can be found [here](https://github.com/erickmerchant/framework-todo)
