require('mocha-sinon')()

const { removeSync } = require('fs-extra')
const { join, resolve } = require('path')
const assert = require('assert')
const { assertExists, assertMatches } = require('../../../test/support/asserts')
const UI = require('../src/index')

const { testTmpPath } = require('../../../test/support/paths')
const target = resolve(testTmpPath, 'site')
const testOptions = { target, markdownIt: { set: function () {} } }

const tokensPage = {
  tokens: [
    {
      type: 'color',
      name: 'Red',
      value: '#F00',
      variable: 'var(--color-red)',
      description: 'Our own version of red.'
    }
  ]
}

describe('UI', () => {
  afterEach(() => { removeSync(testTmpPath) })

  describe('#setup', () => {
    it('should copy the UI static files', async () => {
      await UI.setup(testOptions)

      assertExists(join(target, '_assets', 'scripts'))
      assertExists(join(target, '_assets', 'styles'))
    })

    it('should configure the markdown parser', async function () {
      const markdownIt = { set: this.sinon.stub() }
      const opts = Object.assign({}, testOptions, { markdownIt })
      await UI.setup(opts)

      this.sinon.assert.calledOnce(markdownIt.set)

      this.sinon.restore()
    })

    it('should throw error if the target is not set', async () => {
      const opts = Object.assign({}, testOptions)
      delete opts.target

      try {
        await UI.setup(opts)
      } catch (error) {
        assert(error)
      }
    })

    it('should throw error with debug details if the debug flag is set', async () => {
      const opts = Object.assign({}, testOptions)
      opts.debug = true
      delete opts.target

      try {
        await UI.setup(opts)
      } catch (error) {
        assertMatches(error.message, '"debug": true')
        assertMatches(error.message, '"markdownIt": {}')
      }
    })
  })

  describe('#render', async () => {
    it('should render the index.html file including the state', async () => {
      const index = await UI.render(testOptions, 'index', { state: { config: { name: 'Test Render' } } })

      assertMatches(index, 'Test Render')
    })

    it('should render the tokens including the colors', async () => {
      const tokens = await UI.render(testOptions, 'tokens', tokensPage)

      assertMatches(tokens, 'Red')
      assertMatches(tokens, '#FF0000')
      assertMatches(tokens, /rgb\(255, 0, 0\)/)
      assertMatches(tokens, /hsl\(0, 100%, 50%\)/)
    })

    it('should render the tokens including the localizations', async () => {
      const tokens = await UI.render(testOptions, 'tokens', tokensPage)

      assertMatches(tokens, '<dt class="uie-color-token__label">Description</dt>')
      assertMatches(tokens, '<dt class="uie-color-token__label">Variable</dt>')
    })

    it('should render the sketch output including the colors', async () => {
      const state = {
        pages: {
          colors: {
            tokens: [
              {
                type: 'color',
                name: 'Blanched Almond',
                value: 'BlanchedAlmond'
              }
            ]
          }
        }
      }
      const sketch = await UI.render(testOptions, 'sketch', { state })

      assertMatches(sketch, 'BlanchedAlmond')
      assertMatches(sketch, 'Blanched Almond')
    })

    it('should render the sketch output including the variants', async () => {
      const state = {
        components: {
          button: {
            title: 'Button',
            variants: [
              {
                title: 'Primary',
                rendered: '<button class="button button--primary">Call To Action</button>'
              }
            ]
          }
        }
      }
      const sketch = await UI.render(testOptions, 'sketch', { state })

      assertMatches(sketch, 'Button/Primary')
      assertMatches(sketch, '<button class="button button--primary">Call To Action</button>')
    })

    it('should include the set locale if the passed language is available', async () => {
      const opts = Object.assign({}, testOptions, { lang: 'de' })
      const index = await UI.render(opts, 'index', { state: {} })

      assertMatches(index, 'html lang="de"')
    })

    it('should default to english locale if the passed language is not available', async () => {
      const opts = Object.assign({}, testOptions, { lang: 'pl' })
      const index = await UI.render(opts, 'index', { state: {} })

      assertMatches(index, 'html lang="en"')
    })

    it('should throw error if the template cannot be rendered', async () => {
      try {
        await UI.render({}, 'does-not-exist', { state: {} })
      } catch (error) {
        assert(error)

        assertMatches(error.message, 'UI could not render template "does-not-exist"')
      }
    })

    it('should throw detailed error if the debug option is set', async () => {
      try {
        await UI.render({ debug: true }, 'index', { state: {} })
      } catch (error) {
        assert(error)

        assertMatches(error.message, '"state": {}')
      }
    })
  })
})
