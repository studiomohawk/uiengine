const fs = require('fs-extra')
const { join, resolve } = require('path')
const Factory = require('./support/factory')
const { assertContentMatches, assertExists, assertDoesNotExist } = require('../../../test/support/asserts')
const Builder = require('../src/builder')
const Interface = require('../src/interface')
const Connector = require('../src/connector')

const { testProjectPath, testTmpPath } = require('../../../test/support/paths')
const { adapters } = require('./support/adapters')
const target = resolve(testTmpPath, 'site')

const state = {
  config: {
    name: 'Builder Test',
    version: '0.1.0',
    update: Date.now(),
    source: {
      base: testProjectPath,
      configFile: resolve(testProjectPath, 'uiengine.config.js'),
      components: resolve(testProjectPath, 'src', 'components'),
      templates: resolve(testProjectPath, 'src', 'templates'),
      entities: resolve(testProjectPath, 'src', 'uiengine', 'entities'),
      pages: resolve(testProjectPath, 'src', 'uiengine', 'pages'),
      data: resolve(testProjectPath, '..', 'fixtures')
    },
    target,
    adapters,
    template: 'uiengine.pug'
  },
  pages: {
    'index': Factory.page('index', {
      title: 'Home',
      path: '',
      content: '<h1>Homepage</h1>',
      childIds: ['patterns', 'testcases']
    }),

    'patterns': Factory.page('patterns', {
      title: 'Pattern Library',
      path: 'patterns',
      componentIds: ['input']
    }),

    'tokens': Factory.page('tokens', {
      title: 'Tokens',
      path: 'tokens',
      tokens: [
        {
          name: 'Test',
          type: 'color',
          value: '#123456'
        }
      ]
    }),

    'prototype': Factory.page('prototype', {
      title: 'Sandbox',
      path: 'prototype',
      childIds: ['prototype/custom-page']
    }),

    'prototype/custom-page': Factory.page('prototype/custom-page', {
      title: 'Custom Page',
      template: 'page.pug',
      content: 'Content for custom template',
      context: {
        myContextVariable: 'This is my context'
      }
    }),

    'testcases': Factory.page('testcases', {
      title: 'Testcases',
      path: 'testcases',
      files: [
        resolve(testProjectPath, 'src', 'uiengine', 'pages', 'testcases', 'index.txt'),
        resolve(testProjectPath, 'src', 'uiengine', 'pages', 'testcases', 'extra-files', 'file-in-folder.txt'),
        resolve(testProjectPath, 'src', 'uiengine', 'pages', 'testcases', 'extra-files', 'subfolder', 'file-in-subfolder.txt'),
        resolve(testProjectPath, 'src', 'uiengine', 'pages', 'testcases', '_hidden-files', 'file-in-folder.txt')
      ]
    }),

    'testcases/custom-path': Factory.page('testcases/custom-path', {
      title: 'Custom Path',
      path: 'testcases/page-with-custom-path',
      files: [
        resolve(testProjectPath, 'src', 'uiengine', 'pages', 'testcases', 'custom-path', 'file.txt'),
        resolve(testProjectPath, 'src', 'uiengine', 'pages', 'testcases', 'custom-path', 'extra-files', 'file-in-folder.txt')
      ]
    }),

    'entities': Factory.page('entities', {
      title: 'Entities',
      path: '_entities',
      type: 'entities'
    })
  },
  navigation: {
    'index': Factory.navigation('index', {
      itemId: 'index',
      title: 'Home',
      path: '/',
      content: '<h1>Homepage</h1>',
      childIds: ['patterns', 'testcases']
    }),

    'patterns': Factory.navigation('patterns', {
      itemId: 'patterns',
      title: 'Pattern Library',
      path: '/patterns/',
      parentId: 'index',
      childIds: ['patterns/input']
    }),

    'patterns/input': Factory.navigation('patterns/input', {
      itemId: 'input',
      title: 'Awesome Input',
      path: 'patterns/input',
      type: 'component',
      parentId: 'patterns'
    }),

    'prototype': Factory.navigation('prototype', {
      itemId: 'prototype',
      title: 'Sandbox',
      path: 'prototype',
      parentId: 'index'
    }),

    'prototype/custom-page': Factory.navigation('prototype/custom-page', {
      itemId: 'prototype/custom-page',
      title: 'Custom Page',
      path: 'prototype/custom-page',
      type: 'page',
      template: 'page.pug',
      content: 'Content for custom template',
      context: {
        myContextVariable: 'This is my context'
      },
      parentId: 'prototype'
    }),

    'entities': Factory.navigation('entities', {
      itemId: 'entities',
      title: 'Entities',
      path: '_entities',
      type: 'entities',
      parentId: 'index'
    }),

    'testcases': Factory.navigation('testcases', {
      itemId: 'testcases',
      title: 'Testcases',
      path: 'testcases',
      parentId: 'index'
    }),

    'testcases/custom-path': Factory.navigation('testcases/custom-path', {
      itemId: 'testcases/custom-path',
      title: 'Custom Path',
      path: 'documentation',
      parentId: 'testcases'
    })
  },

  components: {
    input: Factory.component('input', {
      title: 'Awesome Input',
      content: '<p>An input field that can be used inside a form.</p>',
      variants: [
        {
          id: 'input/text.pug',
          componentId: 'input',
          file: 'text.pug',
          path: resolve(testProjectPath, 'src', 'components', 'input', 'variants', 'text.pug'),
          content: '<p>This is documentation for the text input.</p>',
          rendered: '<input class="input input--text" id="name" name="person[name]" type="text"/>',
          context: { id: 'name', name: 'person[name]' },
          title: 'Text Input'
        },
        {
          id: 'input/number.pug',
          componentId: 'input',
          file: 'number.pug',
          path: resolve(testProjectPath, 'src', 'components', 'input', 'variants', 'number.pug'),
          template: 'page.pug', // custom template
          content: '<p>This is documentation for the number input.</p>',
          rendered: '<input class="input input--number" id="amount" name="person[amount]" type="text"/>',
          context: { id: 'amount', name: 'person[amount]' },
          title: 'Number Input'
        }
      ]
    })
  },
  entities: {
    Entity: {
      title: {
        type: 'String',
        description: 'Title',
        required: true
      },
      date: {
        type: 'Date',
        description: 'Publising date',
        required: true
      },
      customObject: {
        type: 'CustomObject',
        description: 'A custom object'
      }
    },
    CustomObject: {
      tags: {
        type: 'Array',
        description: 'Tags as strings'
      },
      isHidden: {
        type: 'Boolean',
        default: 'false',
        description: 'Entity should be hidden'
      }
    }
  }
}

describe('Builder', () => {
  afterEach(() => { fs.removeSync(testTmpPath) })
  before(() => Promise.all([
    Interface.setup(state),
    Connector.setup(state)
  ]))

  describe('#generate', () => {
    it('should generate index page', async () => {
      await Builder.generate(state)

      assertExists(join(target, 'index.html'))
    })

    it('should generate the sketch page', async () => {
      await Builder.generate(state)

      assertExists(join(target, '_sketch.html'))
    })
  })

  describe('#generatePageWithTemplate', () => {
    it('should generate page with custom template', async () => {
      await Builder.generatePageWithTemplate(state, 'prototype/custom-page')

      const pagePath = join(target, '_pages', 'prototype', 'custom-page.html')
      assertContentMatches(pagePath, 'This is my context')
    })
  })

  describe('#generatePageWithTokens', () => {
    it('should generate page with tokens', async () => {
      await Builder.generatePageWithTokens(state, 'tokens')

      const pagePath = join(target, '_tokens', 'tokens.html')
      assertContentMatches(pagePath, '#123456')
    })
  })

  describe('#generatePageFiles', () => {
    it('should copy page files', async () => {
      await Builder.generatePageFiles(state, 'testcases')

      assertExists(join(target, 'testcases', 'index.txt'))
      assertExists(join(target, 'testcases', 'extra-files', 'file-in-folder.txt'))
      assertExists(join(target, 'testcases', 'extra-files', 'subfolder', 'file-in-subfolder.txt'))
    })

    it('should copy page files for pages with custom paths', async () => {
      await Builder.generatePageFiles(state, 'testcases/custom-path')

      assertExists(join(target, 'testcases', 'page-with-custom-path', 'file.txt'))
      assertExists(join(target, 'testcases', 'page-with-custom-path', 'extra-files', 'file-in-folder.txt'))
    })
  })

  describe('#generatePagesWithTemplate', () => {
    it('should generate pages having this template', async () => {
      await Builder.generatePagesWithTemplate(state, 'page.pug')

      assertExists(join(target, '_pages', 'prototype', 'custom-page.html'))
    })
  })

  describe('#generateVariantsWithTemplate', () => {
    it('should generate variants using the default preview template', async () => {
      await Builder.generateVariantsWithTemplate(state, 'uiengine.pug')

      assertExists(join(target, '_variants', 'input', 'text.pug.html'))
      assertDoesNotExist(join(target, '_variants', 'input', 'number.pug.html'))
    })

    it('should generate variants having a custom template', async () => {
      await Builder.generateVariantsWithTemplate(state, 'page.pug')

      assertExists(join(target, '_variants', 'input', 'number.pug.html'))
      assertDoesNotExist(join(target, '_variants', 'input', 'text.pug.html'))
    })
  })

  describe('#generateComponentVariants', () => {
    it('should generate component variant pages', async () => {
      await Builder.generateComponentVariants(state, 'input')

      assertExists(join(target, '_variants', 'input', 'text.pug.html'))
    })
  })

  describe('#generateVariant', () => {
    it('should generate variant page', async () => {
      const variant = state.components.input.variants[0]
      await Builder.generateVariant(state, variant)

      assertExists(join(target, '_variants', 'input', 'text.pug.html'))
    })
  })

  describe('#generateIncrement', () => {
    describe('with debug level set', () => {
      it('should generate state file', async () => {
        const stateWithDebug = Object.assign({}, state)
        stateWithDebug.config.debug = true

        await Builder.generateIncrement(stateWithDebug)

        assertExists(join(target, '_state.json'))
      })
    })
  })
})
