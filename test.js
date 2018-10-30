const test = require('tape')
const noop = () => {}
const raf = (callback) => {
  process.nextTick(() => { callback() })
}
const newElement = Symbol('new target')
const initialState = Symbol('initial state')
const newState = Symbol('new state')
const dispatchArgument = Symbol('dispatch argument')

test('init to render', (t) => {
  t.plan(9)

  require('./main.js')({
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
  })((dispatch) => {
    t.equal(typeof dispatch, 'function')

    dispatch(dispatchArgument)
  })
})

test('using dispatch', (t) => {
  t.plan(2)

  require('./main.js')({
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

test('dispatch multiple', (t) => {
  t.plan(3)

  require('./main.js')({
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
  })((dispatch) => {
    dispatch(dispatchArgument)

    dispatch(dispatchArgument)
  })
})

const execa = require('execa')
const chalk = require('chalk')
const promisify = require('util').promisify
const readFile = promisify(require('fs').readFile)
const stream = require('stream')
const out = new stream.Writable()
out._write = () => {}

test('src/render.js - functionality', async (t) => {
  t.plan(3)

  const output = []
  const [result1, result2] = await Promise.all([
    readFile('./fixtures/heading-1.html', 'utf-8'),
    readFile('./fixtures/heading-2.html', 'utf-8')
  ])

  await require('./src/render.js')({
    async makeDir (directory) {
      t.equal('fixtures', directory)

      return true
    },
    async writeFile (path, content) {
      output.push([path, content])

      return true
    },
    out
  })({
    store: './fixtures/store.js',
    component: './fixtures/component.js',
    document: './fixtures/document.html',
    selector: 'main',
    location: 'location',
    output: false
  })

  process.nextTick(() => {
    t.deepEqual(output, [
      [
        'fixtures/heading-1.html',
        result1
      ],
      [
        'fixtures/heading-2.html',
        result2
      ]
    ])
  })
})

test('src/render.js - console', async (t) => {
  t.plan(1)

  const output = []

  await require('./src/render.js')({
    async makeDir (directory) {
      return true
    },
    async writeFile (path, content) {
      return true
    },
    out: {
      write (str) {
        output.push(str)
      }
    }
  })({
    store: './fixtures/store.js',
    component: './fixtures/component.js',
    document: './fixtures/document.html',
    selector: 'main',
    location: 'location',
    output: false
  })

  process.nextTick(() => {
    t.deepEqual(output, [
      `${chalk.gray('[framework render]')} saved fixtures/heading-1.html\n`,
      `${chalk.gray('[framework render]')} saved fixtures/heading-2.html\n`
    ])
  })
})

test('cli.js render', async (t) => {
  t.plan(4)

  try {
    await execa('node', ['./cli.js', 'render', '-h'])
  } catch (e) {
    t.ok(e)

    t.equal(e.stderr.includes('Usage'), true)

    t.equal(e.stderr.includes('Options'), true)

    t.equal(e.stderr.includes('Parameters'), true)
  }
})
