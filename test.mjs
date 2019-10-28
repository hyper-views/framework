import test from 'tape'
import jsdom from 'jsdom'
import delay from 'delay'
import streamPromise from 'stream-to-promise'
import {createReadStream} from 'fs'
import main, {view, domUpdate} from '.'
import component from './fixtures/component.mjs'

const noop = () => {}
const newElement = Symbol('new target')

test('main.mjs - init to render', (t) => {
  t.plan(3)

  main({
    state: null,
    component({state, commit}) {
      t.equal(typeof commit, 'function')

      t.equal(state, null)

      return newElement
    },
    update(element) {
      t.deepEqual(element, newElement)
    }
  })
})

test('main.mjs - using commit', (t) => {
  t.plan(1)

  main({
    state: null,
    component({state, commit}) {
      if (state == null) {
        process.nextTick(() => {
          commit((state) => {
            t.equal(state, null)

            return 1
          })
        })
      }

      return newElement
    },
    update: noop
  })
})

test('main.mjs - commit multiple', (t) => {
  t.plan(1)

  main({
    state: null,
    component({state}) {
      t.equal(state, null)

      return newElement
    },
    update: noop
  })
})

test('view.mjs - producing virtual dom', (t) => {
  t.plan(3)

  const {div} = view()

  t.deepEquals(div`<div class=${'a'}>${1}</div>`, {view: 'div', tree: {type: 'node', tag: 'div', dynamic: true, attributes: [{key: 'class', variable: true, value: 0}], children: [{type: 'variable', variable: true, value: 1}]}, variables: ['a', 1]})

  t.deepEquals(div`<div class=${'b'}>${2}</div>`, {view: 'div', tree: {type: 'node', tag: 'div', dynamic: true, attributes: [{key: 'class', variable: true, value: 0}], children: [{type: 'variable', variable: true, value: 1}]}, variables: ['b', 2]})

  t.deepEquals(div`<div class=${'c'}>${3}</div>`, {view: 'div', tree: {type: 'node', tag: 'div', dynamic: true, attributes: [{key: 'class', variable: true, value: 0}], children: [{type: 'variable', variable: true, value: 1}]}, variables: ['c', 3]})
})

test('update.mjs - patching the dom', async (t) => {
  t.plan(6)

  const html = await streamPromise(createReadStream('./fixtures/document.html', 'utf8'))

  const dom = new jsdom.JSDOM(html)
  const main = dom.window.document.querySelector('main')

  const update = domUpdate(main)

  update(component({
    state: {
      heading: 'Test 1',
      src: 'foo.jpg',
      onclick() {
        t.ok(true)
      }
    }
  }))

  await delay(0)

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  const result1 = main.outerHTML

  t.equals(result1, '<main><h1>Test 1</h1><img src="foo.jpg"><button type="button">Approve</button>  </main>')

  update(component({
    state: {
      heading: 'Test 2',
      src: 'foo.jpg',
      onclick: noop,
      hasSafe: true,
      hasP: true,
      isRed: true,
      pText1: 'lorem ipsum',
      pText2: 'dolor',
      pText3: '?'
    }
  }))

  await delay(0)

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  const result2 = main.outerHTML

  t.equals(result2, '<main><h1>Test 2</h1><img src="foo.jpg"><button type="button">Approve</button><div>some</div><div>raw</div><div>html</div> <p class="red" data-red="yes">lorem ipsum dolor ?</p> </main>')

  update(component({
    state: {
      heading: 'Test 3',
      src: 'bar.jpg',
      onclick: null,
      hasP: true,
      isRed: false,
      pText1: 'lorem ipsum',
      pText2: 'dolor',
      pText3: '?'
    }
  }))

  await delay(0)

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  const result3 = main.outerHTML

  t.equals(result3, '<main><h1>Test 3</h1><img src="bar.jpg"><button type="button">Approve</button> <p class="blue" data-blue="yes">lorem ipsum dolor ?</p> </main>')

  update(component({
    state: {
      heading: 'Test 6',
      src: 'bar.jpg',
      onclick: null,
      hasSvg: true,
      svgPath: 'M2 2 2 34 34 34 34 2 z'
    }
  }))

  await delay(0)

  const result6 = main.outerHTML

  t.equals(result6, '<main><h1>Test 6</h1><img src="bar.jpg"><button type="button">Approve</button>  <svg><path d="M2 2 2 34 34 34 34 2 z"></path></svg></main>')

  update(component({
    state: {
      heading: 'Test 6',
      src: 'bar.jpg',
      onclick: null,
      hasSvg: true,
      svgPath: 'M2 0 0 30 32 32 30 2 z'
    }
  }))

  await delay(0)

  const result7 = main.outerHTML

  t.equals(result7, '<main><h1>Test 6</h1><img src="bar.jpg"><button type="button">Approve</button>  <svg><path d="M2 0 0 30 32 32 30 2 z"></path></svg></main>')
})
