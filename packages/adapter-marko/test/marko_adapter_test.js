require('mocha-sinon')()

const assert = require('assert')
const { assertMatches } = require('../../../test/support/asserts')
const { resolve } = require('path')
const Adapter = require('../src/index')

const templatePath = resolve(__dirname, 'fixtures', 'template.marko')
const defaultOptions = {
  install: {
    compilerOptions: {
      writeToDisk: false
    }
  }
}

describe('Marko adapter', () => {
  before(() => Adapter.setup(defaultOptions))
  afterEach(function () {
    this.sinon.restore()
  })

  describe('#setup', () => {
    it('should invoke the require hook install function with the given options', async function () {
      const nodeRequire = require('marko/node-require')

      this.sinon.stub(nodeRequire, 'install')
      await Adapter.setup(defaultOptions)

      this.sinon.assert.calledOnce(nodeRequire.install)
      this.sinon.assert.calledWith(nodeRequire.install, defaultOptions.install)
    })
  })

  describe('#render', () => {
    it('should render the template with the given data', async () => {
      const options = {}
      const data = { myData: 1 }
      const rendered = await Adapter.render(options, templatePath, data)

      assert.strictEqual(rendered, '<p>1</p>')
    })

    it('should throw error if the file does not exist', async () => {
      try {
        await Adapter.render({}, 'does-not-exist.marko')
      } catch (error) {
        assert(error)

        assertMatches(error.message, 'Marko could not render "does-not-exist.marko"')
      }
    })

    it('should throw detailed error if the debug option is set', async () => {
      try {
        const templatePath = resolve(__dirname, 'fixtures', 'invalid-template.marko')
        const data = { myData: 1 }
        await Adapter.render({ debug: true }, templatePath, data)
      } catch (error) {
        assert(error)

        assertMatches(error.message, 'invalid-template.marko')
        assertMatches(error.message, '"myData": 1')
      }
    })
  })

  describe('#registerComponentFile', () => {
    it('should invalidate the module cache', async () => {
      // is set by previous render test
      assert(require.cache[require.resolve(templatePath)])

      await Adapter.registerComponentFile({}, templatePath)

      assert(!require.cache[require.resolve(templatePath)])
    })
  })

  describe('#filesForComponent', () => {
    it('should return the component file', () => {
      const files = Adapter.filesForComponent('button')

      assert.strictEqual(files.length, 1)
      assert.strictEqual(files[0].basename, 'button.marko')
    })
  })

  describe('#filesForVariant', () => {
    it('should return the variant file', () => {
      const files = Adapter.filesForVariant('button', 'primary')

      assert.strictEqual(files.length, 1)
      assert.strictEqual(files[0].basename, 'primary.marko')
    })
  })
})
