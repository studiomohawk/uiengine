const pug = require('pug')

async function render (options, filePath, data = {}) {
  const context = Object.assign({}, options, data)

  try {
    return pug.renderFile(filePath, context)
  } catch (err) {
    const message = [`Pug could not render "${filePath}"!`, err]

    if (options.debug) message.push(JSON.stringify(context, null, 2))

    const error = new Error(message.join('\n\n'))
    error.code = err.code
    error.path = filePath

    throw error
  }
}

const filesForComponent = (componentName) =>
  [
    {
      basename: `${componentName}.pug`,
      data: `mixin ${componentName}()\n  .${componentName}&attributes(attributes)\n    //- TODO: implement\n`
    }
  ]

const filesForVariant = (componentName, variantName) =>
  [
    {
      basename: `${variantName}.pug`,
      data: `include ../${componentName}.pug\n\n+${componentName}()\n`
    }
  ]

module.exports = {
  filesForComponent,
  filesForVariant,
  render
}
