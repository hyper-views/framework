import test from 'tape'
import jsdom from 'jsdom'
import delay from 'delay'
import {createApp, createDomView, html} from './main.mjs'
import {stringify} from './stringify.mjs'
import {component} from './fixtures/component.mjs'
const document = `
<!doctype html>
<html>
  <head>
    <title>Test Document</title>
  </head>
  <body>
    <main>
    </main>
  </body>
</html>
`

const noop = () => {}
const newElement = Symbol('new target')

test('main.mjs render', async (t) => {
  const app = createApp(null)

  t.equal(typeof app.commit, 'function')

  app.render((state) => {
    t.equal(state, null)

    return newElement
  })

  await delay(0)

  t.end()
})

test('main.mjs commit', async (t) => {
  const app = createApp(null)

  app.render(noop)

  app.commit((state) => {
    t.equal(state, null)

    return 1
  })

  await delay(0)

  t.end()
})

test('main.mjs html', async (t) => {
  t.deepEquals(html`<div class=${'a'}>${1}</div>`, {view: 1, type: 'node', tag: 'div', dynamic: true, attributes: [{key: 'class', variable: true, value: 0}], children: [{type: 'variable', variable: true, value: 1}], variables: ['a', 1]})

  t.deepEquals(html`<div class=${'b'}>${2}</div>`, {view: 2, type: 'node', tag: 'div', dynamic: true, attributes: [{key: 'class', variable: true, value: 0}], children: [{type: 'variable', variable: true, value: 1}], variables: ['b', 2]})

  t.deepEquals(html`<div class=${'c'}>${3}</div>`, {view: 3, type: 'node', tag: 'div', dynamic: true, attributes: [{key: 'class', variable: true, value: 0}], children: [{type: 'variable', variable: true, value: 1}], variables: ['c', 3]})

  t.end()
})

test('main.mjs createDomView', async (t) => {
  const dom = new jsdom.JSDOM(document)
  const main = dom.window.document.querySelector('main')

  const view = createDomView(main, component)

  view({
    heading: 'Test 1',
    src: 'foo.jpg',
    onclick() {
      t.ok(true)
    }
  })

  await delay(0)

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  const result1 = main.outerHTML

  t.equals(result1, '<main><h1>Test 1</h1><img src="foo.jpg"><button type="button">Approve</button> </main>')

  view({
    heading: 'Test 2',
    src: 'foo.jpg',
    onclick: noop,
    hasP: true,
    isRed: true,
    pText1: 'lorem ipsum',
    pText2: 'dolor',
    pText3: '?'
  })

  await delay(0)

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  const result2 = main.outerHTML

  t.equals(result2, '<main><h1>Test 2</h1><img src="foo.jpg"><button type="button">Approve</button><p class="red">lorem ipsum dolor ?</p> </main>')

  view({
    heading: 'Test 3',
    src: 'bar.jpg',
    onclick: null,
    hasP: true,
    isRed: false,
    pText1: 'lorem ipsum',
    pText2: 'dolor',
    pText3: '?'
  })

  await delay(0)

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  const result3 = main.outerHTML

  t.equals(result3, '<main><h1>Test 3</h1><img src="bar.jpg"><button type="button">Approve</button><p class="blue">lorem ipsum dolor ?</p> </main>')

  view({
    heading: 'Test 6',
    src: 'bar.jpg',
    onclick: null,
    hasSvg: true,
    svgPath: 'M2 2 2 34 34 34 34 2 z'
  })

  await delay(0)

  const result6 = main.outerHTML

  t.equals(result6, '<main><h1>Test 6</h1><img src="bar.jpg"><button type="button">Approve</button> <svg><path d="M2 2 2 34 34 34 34 2 z"></path></svg></main>')

  view({
    heading: 'Test 6',
    src: 'bar.jpg',
    onclick: null,
    hasSvg: true,
    svgPath: 'M2 0 0 30 32 32 30 2 z'
  })

  await delay(0)

  const result7 = main.outerHTML

  t.equals(result7, '<main><h1>Test 6</h1><img src="bar.jpg"><button type="button">Approve</button> <svg><path d="M2 0 0 30 32 32 30 2 z"></path></svg></main>')

  await delay(0)

  t.end()
})

test('main.mjs createDomView', async (t) => {
  const dom = new jsdom.JSDOM(document)
  const main = dom.window.document.querySelector('main')

  const view = createDomView(main, component)

  view({
    noRoot: true,
    heading: 'Test 1',
    src: 'foo.jpg',
    onclick() {
      t.ok(true)
    }
  })

  await delay(0)

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  const result1 = main.outerHTML

  t.equals(result1, '<main><h1>Test 1</h1><img src="foo.jpg"><button type="button">Approve</button></main>')

  view({
    noRoot: true,
    heading: 'Test 2',
    src: 'foo.jpg',
    onclick: noop,
    hasP: true,
    isRed: true,
    pText1: 'lorem ipsum',
    pText2: 'dolor',
    pText3: '?'
  })

  await delay(0)

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  const result2 = main.outerHTML

  t.equals(result2, '<main><h1>Test 2</h1><img src="foo.jpg"><button type="button">Approve</button><p class="red">lorem ipsum dolor ?</p></main>')

  view({
    noRoot: true,
    heading: 'Test 3',
    src: 'bar.jpg',
    onclick: null,
    hasP: true,
    isRed: false,
    pText1: 'lorem ipsum',
    pText2: 'dolor',
    pText3: '?'
  })

  await delay(0)

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  const result3 = main.outerHTML

  t.equals(result3, '<main><h1>Test 3</h1><img src="bar.jpg"><button type="button">Approve</button><p class="blue">lorem ipsum dolor ?</p></main>')

  view({
    noRoot: true,
    heading: 'Test 6',
    src: 'bar.jpg',
    onclick: null,
    hasSvg: true,
    svgPath: 'M2 2 2 34 34 34 34 2 z'
  })

  await delay(0)

  const result6 = main.outerHTML

  t.equals(result6, '<main><h1>Test 6</h1><img src="bar.jpg"><button type="button">Approve</button><svg><path d="M2 2 2 34 34 34 34 2 z"></path></svg></main>')

  view({
    noRoot: true,
    heading: 'Test 6',
    src: 'bar.jpg',
    onclick: null,
    hasSvg: true,
    svgPath: 'M2 0 0 30 32 32 30 2 z'
  })

  await delay(0)

  const result7 = main.outerHTML

  t.equals(result7, '<main><h1>Test 6</h1><img src="bar.jpg"><button type="button">Approve</button><svg><path d="M2 0 0 30 32 32 30 2 z"></path></svg></main>')

  await delay(0)

  t.end()
})

test('stringify.mjs stringify', async (t) => {
  const component = ({state}) => html`<div class=${state.classes}>
      ${html`<span>${state.one}</span>`}
      ${html`<span>${[state.two, state.three]}</span>`}
      <div>
        <span></span>
      </div>
    </div>`

  const state = {
    classes: 'a b c',
    one: '1',
    two: '2',
    three: '3'
  }

  t.equals(stringify(component({state})), '<div class="a b c"><span>1</span>\n      <span>23</span><div><span></span></div></div>')

  await delay(0)

  t.end()
})
