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
    component(state, commit) {
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
    component(state, commit) {
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
    component(state) {
      t.equal(state, null)

      return newElement
    },
    update: noop
  })
})

test('view.mjs - producing virtual dom', (t) => {
  t.plan(3)

  const {div} = view

  t.deepEquals(JSON.stringify(div`<div class=${'a'}>${1}</div>`), JSON.stringify({tree: {tag: 'div', attributes: {class: undefined}, _attributes: [], children: [undefined]}, variables: ['a', 1]}))

  t.deepEquals(JSON.stringify(div`<div class=${'b'}>${2}</div>`), JSON.stringify({tree: {tag: 'div', attributes: {class: undefined}, _attributes: [], children: [undefined]}, variables: ['b', 2]}))

  t.deepEquals(JSON.stringify(div`<div class=${'c'}>${3}</div>`), JSON.stringify({tree: {tag: 'div', attributes: {class: undefined}, _attributes: [], children: [undefined]}, variables: ['c', 3]}))
})

test('update.mjs - patching the dom', async (t) => {
  t.plan(6)

  const html = await streamPromise(createReadStream('./fixtures/document.html', 'utf8'))

  const dom = new jsdom.JSDOM(html)

  const update = domUpdate(dom.window.document.querySelector('main'))

  update(component({state: {heading: 'Test 1'}}))

  await delay(0)

  const result1 = dom.serialize()

  t.equals(result1.replace(/>\s+</g, '><'), '<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 1</h1></main></body></html>')

  update(component({
    state: {
      heading: 'Test 2',
      hasSafe: true,
      hasP: true,
      isRed: true,
      pText: 'lorem ipsum dolor ....'
    }
  }))

  await delay(0)

  const result2 = dom.serialize()

  t.equals(result2.replace(/>\s+</g, '><'), '<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 2</h1><div>some</div><div>raw</div><div>html</div><p a="b" class="red" data-red="yes">lorem ipsum dolor ....</p></main></body></html>')

  update(component({
    state: {
      heading: 'Test 3',
      hasP: true,
      isRed: false,
      pText: 'lorem ipsum dolor ....'
    }
  }))

  await delay(0)

  const result3 = dom.serialize()

  t.equals(result3.replace(/>\s+</g, '><'), '<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 3</h1><p a="b" class="blue" data-blue="yes">lorem ipsum dolor ....</p></main></body></html>')

  update(component({
    state: {
      heading: 'Test 4',
      hasForm: true,
      formStep: 1
    }
  }))

  await delay(0)

  const result4 = dom.serialize()

  t.equals(result4.replace(/>\s+</g, '><'), '<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 4</h1><form><input value="1"><input type="checkbox"><select><option selected="">1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select><button type="button" disabled="">Next</button></form></main></body></html>')

  update(component({
    state: {
      heading: 'Test 5',
      hasForm: true,
      formStep: 2
    }
  }))

  await delay(0)

  const result5 = dom.serialize()

  t.equals(result5.replace(/>\s+</g, '><'), '<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 5</h1><form><input><input type="checkbox"><select><option>1</option><option selected="">2</option><option>3</option></select><button type="submit">Submit</button></form></main></body></html>')

  update(component({
    state: {
      heading: 'Test 6',
      hasSvg: true
    }
  }))

  await delay(0)

  const result6 = dom.serialize()

  t.equals(result6.replace(/>\s+</g, '><'), '<!DOCTYPE html><html><head><title>Test Document</title></head><body><main><h1>Test 6</h1><svg><path d="M2 2 2 34 34 34 34 2 z"></path></svg></main></body></html>')
})
