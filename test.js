import test from 'ava'
import jsdom from 'jsdom'
import delay from 'delay'
import {createApp, createDomView, html} from './main.js'
import {stringify} from './stringify.js'
import {component} from './fixtures/component.js'
/* prettier-ignore */
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

test('main.js render', async (t) => {
  const app = createApp(null)

  t.deepEqual(typeof app.commit, 'function')

  await app.render((state) => {
    t.deepEqual(state, null)

    return newElement
  })
})

test('main.js commit', async (t) => {
  const app = createApp(null)

  await app.render(noop)

  app.commit((state) => {
    t.deepEqual(state, null)

    return 1
  })
})

test('main.js html', async (t) => {
  /* prettier-ignore */
  t.deepEqual(html`<div class=${'a'}>${1}</div>`, {view: 1, type: 'node', tag: 'div', dynamic: true, attributes: [{key: 'class', variable: true, value: 0}], children: [{type: 'variable', variable: true, value: 1}], variables: ['a', 1]})

  /* prettier-ignore */
  t.deepEqual(html`<div class=${'b'}>${2}</div>`, {view: 2, type: 'node', tag: 'div', dynamic: true, attributes: [{key: 'class', variable: true, value: 0}], children: [{type: 'variable', variable: true, value: 1}], variables: ['b', 2]})

  /* prettier-ignore */
  t.deepEqual(html`<div class=${'c'}>${3}</div>`, {view: 3, type: 'node', tag: 'div', dynamic: true, attributes: [{key: 'class', variable: true, value: 0}], children: [{type: 'variable', variable: true, value: 1}], variables: ['c', 3]})
})

test('main.js events', async (t) => {
  const dom = new jsdom.JSDOM(document)
  const main = dom.window.document.querySelector('main')

  const view = createDomView(main, component)

  t.plan(4)

  view({
    heading: 'Test 1',
    src: 'foo.jpg',
    onclick() {
      t.pass()
    }
  })

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  await delay(0)

  const result1 = main.outerHTML

  /* prettier-ignore */
  t.deepEqual(result1, '<main><h1>Test 1</h1><img src="foo.jpg"><button type="button">Approve</button> </main>')

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

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  await delay(0)

  const result2 = main.outerHTML

  /* prettier-ignore */
  t.deepEqual(result2, '<main><h1>Test 2</h1><img src="foo.jpg"><button type="button">Approve</button><p class="red">lorem ipsum dolor ?</p> </main>')

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

  main.querySelector('button').dispatchEvent(new dom.window.Event('click'))

  await delay(0)

  const result3 = main.outerHTML

  /* prettier-ignore */
  t.deepEqual(result3, '<main><h1>Test 3</h1><img src="bar.jpg"><button type="button">Approve</button><p class="blue">lorem ipsum dolor ?</p> </main>')
})

test('main.js elements', async (t) => {
  const dom = new jsdom.JSDOM(document)
  const main = dom.window.document.querySelector('main')

  const view = createDomView(main, component)

  view({
    heading: 'Test 6',
    src: 'bar.jpg',
    onclick: null,
    hasSvg: true,
    svgPath: 'M2 2 2 34 34 34 34 2 z'
  })

  const result6 = main.outerHTML

  /* prettier-ignore */
  t.deepEqual(result6, '<main><h1>Test 6</h1><img src="bar.jpg"><button type="button">Approve</button> <svg><path d="M2 2 2 34 34 34 34 2 z"></path></svg></main>')

  view({
    heading: 'Test 6',
    src: 'bar.jpg',
    onclick: null,
    hasSvg: true,
    svgPath: 'M2 0 0 30 32 32 30 2 z'
  })

  const result7 = main.outerHTML

  /* prettier-ignore */
  t.deepEqual(result7, '<main><h1>Test 6</h1><img src="bar.jpg"><button type="button">Approve</button> <svg><path d="M2 0 0 30 32 32 30 2 z"></path></svg></main>')
})

test('stringify.js stringify', async (t) => {
  /* prettier-ignore */
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

  /* prettier-ignore */
  t.deepEqual(stringify(component({state})), '<div class="a b c"><span>1</span>\n      <span>23</span><div><span></span></div></div>')
})
