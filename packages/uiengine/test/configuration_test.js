const assert = require('assert')
const { resolve } = require('path')

const { testProjectPath, testProjectTargetPath } = require('../../../test/support/paths')
const Configuration = require('../src/configuration')

const testConfigPath = resolve(testProjectPath, 'uiengine.yml')

describe('Configuration', () => {
  describe('#read', () => {
    it('should return config object', async () => {
      const config = await Configuration.read(testConfigPath)

      assert.equal(config.name, 'UIengine Sample Project')
      assert.equal(config.version, '1.0.0')
    })

    it('should take options', async () => {
      const opts = { debug: true }
      const config = await Configuration.read(testConfigPath, opts)

      assert(config.debug)
    })

    it('should resolve target and source paths', async () => {
      const config = await Configuration.read(testConfigPath)

      assert.equal(config.target, testProjectTargetPath)
      assert.equal(config.source.components, resolve(testProjectPath, 'src', 'components'))
      assert.equal(config.source.templates, resolve(testProjectPath, 'src', 'templates'))
      assert.equal(config.source.pages, resolve(testProjectPath, 'src', 'uiengine', 'pages'))
      assert.equal(config.source.entities, resolve(testProjectPath, 'src', 'uiengine', 'entities'))
      assert.equal(config.source.data, resolve(testProjectPath, 'src', 'uiengine', 'data'))
      assert.equal(config.source.base, resolve(testProjectPath))
      assert.equal(config.source.configFile, testConfigPath)
    })

    it('should resolve theme', async () => {
      const config = await Configuration.read(testConfigPath)

      assert.equal(config.theme.module, 'uiengine-theme-default')
      assert.equal(config.theme.options.customStylesFile, '/assets/styles/uiengine-custom-styles.css')
    })

    it('should resolve default theme if no theme is given', async () => {
      const config = await Configuration.read(resolve(testProjectPath, 'uiengine-use-default-theme.yml'))

      assert.equal(config.theme.module, 'uiengine-theme-default')
      assert.equal(Object.keys(config.theme.options).length, 0)
    })

    it('should resolve adapters', async () => {
      const config = await Configuration.read(testConfigPath)

      assert.equal(config.adapters.pug.module, 'uiengine-adapter-pug')
      assert.equal(config.adapters.pug.options.pretty, true)
      assert.equal(config.adapters.pug.options.basedir, resolve(testProjectPath, 'src', 'components'))
      assert.equal(config.adapters.jsx.module, 'uiengine-adapter-react')
      assert.equal(config.adapters.hbs.module, 'uiengine-adapter-handlebars')
      assert.equal(Object.keys(config.adapters.jsx.options).length, 0)
      assert.equal(Object.keys(config.adapters.hbs.options).length, 0)
    })
  })
})
