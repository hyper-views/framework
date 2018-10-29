const assert = require('assert')
const chalk = require('chalk')
const JSDOM = require('jsdom').JSDOM
const path = require('path')
const get = require('lodash.get')
const streamPromise = require('stream-to-promise')
const fs = require('fs')
const createReadStream = fs.createReadStream

module.exports = (deps) => {
  assert.strictEqual(typeof deps.makeDir, 'function')

  assert.strictEqual(typeof deps.writeFile, 'function')

  assert.strictEqual(typeof deps.out, 'object')

  assert.strictEqual(typeof deps.out.write, 'function')

  return async (args) => {
    const component = require(path.join(process.cwd(), args.component))
    const store = require(path.join(process.cwd(), args.store))
    let outputDirectory = args.output

    if (!outputDirectory) {
      outputDirectory = path.dirname(args.document)
    }

    const html = await streamPromise(createReadStream(args.document, 'utf8'))

    store(commit)

    async function commit (current) {
      assert.strictEqual(typeof current, 'function', 'current must be a function')

      const state = current()

      const dom = new JSDOM(html)
      const element = dom.window.document.querySelector(args.selector)

      if (element) {
        const fragment = new JSDOM(String(component({ state, dispatch, next })))

        element.parentNode.replaceChild(fragment.window.document.querySelector(args.selector), element)
      }

      const result = dom.serialize()
      const location = get(state, args.location, 'index.html')

      assert.strictEqual(typeof location, 'string', 'location must be a string')

      const file = path.join(outputDirectory, path.extname(location) ? location : path.join(location, 'index.html'))
      const relativeFile = path.relative(process.cwd(), file)

      await deps.makeDir(path.dirname(file))

      await deps.writeFile(file, result)

      deps.out.write(`${chalk.gray('[framework render]')} saved ${relativeFile}\n`)
    }
  }
}

function dispatch () {
  throw new Error('dispatch is unavailable')
}

function next () {

}
