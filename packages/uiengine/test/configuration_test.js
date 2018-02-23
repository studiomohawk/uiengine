const assert = require('assert')
const { resolve } = require('path')

const { testProjectPath, testProjectTargetPath } = require('../../../test/support/paths')
const Configuration = require('../src/configuration')

// in the tests we have to provide the config option, because the cwd is
// the project root and cosmiconf does not search test/project.
const testConfigPath = resolve(testProjectPath, 'uiengine.config.js')
const opts = { config: testConfigPath }

describe('Configuration', () => {
  describe('#read', () => {
    it('should return config object', async () => {
      const config = await Configuration.read(opts)

      assert.equal(config.name, 'UIengine Sample Project')
      assert.equal(config.version, '1.0.0')
    })

    it('should take options', async () => {
      const optsWithDebug = Object.assign({}, opts, { debug: true })
      const config = await Configuration.read(optsWithDebug)

      assert(config.debug)
    })

    it('should resolve target and source paths', async () => {
      const config = await Configuration.read(opts)

      assert.equal(config.target, testProjectTargetPath)
      assert.equal(config.source.components, resolve(testProjectPath, 'src', 'components'))
      assert.equal(config.source.templates, resolve(testProjectPath, 'src', 'templates'))
      assert.equal(config.source.pages, resolve(testProjectPath, 'src', 'uiengine', 'pages'))
      assert.equal(config.source.entities, resolve(testProjectPath, 'src', 'uiengine', 'entities'))
      assert.equal(config.source.data, resolve(testProjectPath, 'src', 'uiengine', 'data'))
      assert.equal(config.source.base, resolve(testProjectPath))
      assert.equal(config.source.configFile, resolve(testProjectPath, 'uiengine.config.js'))
    })

    it('should resolve theme', async () => {
      const config = await Configuration.read(opts)

      assert.equal(config.theme.module, 'uiengine-theme-default')
      assert.equal(config.theme.options.customStylesFile, '/assets/styles/uiengine-custom-styles.css')
    })

    it('should resolve adapters', async () => {
      const config = await Configuration.read(opts)

      assert.equal(config.adapters.pug.module, 'uiengine-adapter-pug')
      assert.equal(config.adapters.pug.options.pretty, true)
    })

    it('should resolve default theme if no theme is given', async () => {
      const opts = { config: resolve(testProjectPath, 'uiengine-use-default-theme.yml') }
      const config = await Configuration.read(opts)

      assert.equal(config.theme.module, 'uiengine-theme-default')
      assert.equal(Object.keys(config.theme.options).length, 0)
    })

    it('should resolve adapters', async () => {
      const config = await Configuration.read(opts)

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
