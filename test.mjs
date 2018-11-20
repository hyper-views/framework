import test from 'tape'
import jsdom from 'jsdom'
import streamPromise from 'stream-to-promise'
import { createReadStream } from 'fs'
import html from './html.mjs'
import update from './update.mjs'
import main from './main.mjs'
import component from './fixtures/component.mjs'
const noop = () => {}
const raf = (callback) => {
  process.nextTick(() => { callback() })
}
const newElement = Symbol('new target')
const initialState = Symbol('initial state')
const newState = Symbol('new state')
const dispatchArgument = Symbol('dispatch argument')

test('main.mjs - init to render', (t) => {
  t.plan(9)

  const dispatch = main({
    store (commit) {
      t.equal(commit.name, 'commit')

      t.equal(typeof commit, 'function')

      commit(() => initialState)

      return (arg) => {
        t.equal(arg, dispatchArgument)

        commit((state) => {
          t.equal(state, initialState)

          return newState
        })
      }
    },
    component (app) {
      t.deepEqual(Object.keys(app).length, 2)

      t.equal(typeof app.dispatch, 'function')

      t.equal(app.state, newState)

      return newElement
    },
    update (newElement) {
      t.deepEqual(newElement, newElement)
    },
    raf
  })

  t.equal(typeof dispatch, 'function')

  dispatch(dispatchArgument)
})

test('main.mjs - using dispatch', (t) => {
  t.plan(2)

  main({
    store (commit) {
      commit(() => initialState)

      return (arg) => {
        t.equal(arg, dispatchArgument)

        commit((state) => {
          t.equal(state, initialState)

          return newState
        })
      }
    },
    component ({ dispatch, state }) {
      if (state === initialState) {
        process.nextTick(() => {
          dispatch(dispatchArgument)
        })
      }

      return newElement
    },
    update: noop,
    raf
  })
})

test('main.mjs - dispatch multiple', (t) => {
  t.plan(3)

  const dispatch = main({
    store (commit) {
      commit(() => '')

      return (arg) => {
        t.equal(arg, dispatchArgument)

        commit((state) => {
          return newState
        })
      }
    },
    component (app) {
      t.equal(app.state, newState)

      return newElement
    },
    update: noop,
    raf
  })

  dispatch(dispatchArgument)

  dispatch(dispatchArgument)
})

test('html.mjs - producing virtual dom', (t) => {
  t.plan(5)

  const { div } = html

  t.deepEquals(div(false, { class: 'test' }, 123), null)

  t.deepEquals(div(true, { class: 'test' }, 123), { tag: 'div', hooks: {}, attributes: { class: 'test' }, children: [123] })

  t.deepEquals(div(true, () => [{ class: 'test' }], 123), { tag: 'div', hooks: {}, attributes: { class: 'test' }, children: [123] })

  t.deepEquals(div(true, () => [{ class: 'test' }, 123]), { tag: 'div', hooks: {}, attributes: { class: 'test' }, children: [123] })

  t.deepEquals(div(true, ({ onmount }) => {
    onmount(noop)

    return [{ class: 'test' }, 123]
  }), { tag: 'div', hooks: { onmount: noop }, attributes: { class: 'test' }, children: [123] })
})

test('update.mjs - patching the dom', async (t) => {
  t.plan(8)

  const html = await streamPromise(createReadStream('./fixtures/document.html', 'utf8'))

  const dom = new jsdom.JSDOM(html)

  const u = update(dom.window.document.querySelector('main'))

  u(component({ state: { heading: 'Test 1' }, dispatch: noop }))

  const result1 = dom.serialize()

  t.equals(result1.replace(/>\s+</g, '><'), `<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 1</h1></main></body></html>`)

  u(component({
    state: {
      heading: 'Test 2',
      hasP: true,
      isRed: true,
      pText: 'lorem ipsum dolor ....'
    },
    dispatch: noop
  }))

  const result2 = dom.serialize()

  t.equals(result2.replace(/>\s+</g, '><'), `<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 2</h1><p class="red" data-red="yes">lorem ipsum dolor ....</p></main></body></html>`)

  u(component({
    state: {
      heading: 'Test 3',
      hasP: true,
      isRed: false,
      pText: 'lorem ipsum dolor ....'
    },
    dispatch: noop
  }))

  const result3 = dom.serialize()

  t.equals(result3.replace(/>\s+</g, '><'), `<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 3</h1><p class="blue" data-blue="yes">lorem ipsum dolor ....</p></main></body></html>`)

  u(component({
    state: {
      heading: 'Test 4',
      hasForm: true,
      formStep: 1
    },
    dispatch: noop
  }))

  const result4 = dom.serialize()

  t.equals(result4.replace(/>\s+</g, '><'), `<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 4</h1><form><input value="1"><input type="checkbox"><select><option selected="">1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select><button type="button" disabled="">Next</button></form></main></body></html>`)

  u(component({
    state: {
      heading: 'Test 5',
      hasForm: true,
      formStep: 2
    },
    dispatch: noop
  }))

  const result5 = dom.serialize()

  t.equals(result5.replace(/>\s+</g, '><'), `<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 5</h1><form><input><input type="checkbox"><select><option>1</option><option selected="">2</option><option>3</option></select><button type="submit">Submit</button></form></main></body></html>`)

  u(component({
    state: {
      heading: 'Test 6',
      hasSvg: true
    },
    dispatch: noop
  }))

  const result6 = dom.serialize()

  t.equals(result6.replace(/>\s+</g, '><'), `<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 6</h1><svg xmlns="http://www.w3.org/2000/svg"><path d="M2 2 2 34 34 34 34 2 z"></path></svg></main></body></html>`)

  u(component({
    state: {
      heading: 'Test 7',
      hasOnmount: true
    },
    dispatch: noop
  }))

  const result7 = dom.serialize()

  t.equals(result7.replace(/>\s+</g, '><'), `<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 7</h1><div>onmount set</div></main></body></html>`)

  u(component({
    state: {
      heading: 'Test 8',
      hasOnupdate: true
    },
    dispatch: noop
  }))

  const result8 = dom.serialize()

  t.equals(result8.replace(/>\s+</g, '><'), `<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 8</h1><div>onupdate set</div></main></body></html>`)
})
