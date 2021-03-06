# User Interface

## Configuration

This is what the options and their defaults look like:

```js
{
  ui: {
    lang: 'en',
    hljs: 'atom-one-dark',
    base: '/',
    customStylesFile: '/custom-styles-file.css',
    debug: false,
    cache: true

    breakpoints: {
      XS: 320,
      S: 560,
      M: 760,
      L: 960,
      XL: 1280
    },

    themes: [
      {
        id: 'default',
        title: 'Default'
      },
      {
        id: 'funky',
        title: 'Bright colors'
      }
    ]
  }
}
```

### lang

Localization language for the interface. Available options:

- `en` (default)
- `de`

Feel free to send a pull request with additional [localizations](../packages/ui/src/locales)!

### hljs

The highlight.js theme for the code blocks, defaults to `atom-one-dark`.
For a list of available options see the [highlight.js demo](https://highlightjs.org/static/demo/).

### customStylesFile

The path to a css files containing variable overrides and extensions for the UI.
For an example see the [custom styles file of the test project](../test/project/src/assets/styles/uiengine-custom-styles.css).

### base

Sets the base path for the output.
Defaults to `/`.

### debug

Enable debug output, most likely to be used during UI development.

Available options:

- `false` (default)
- `true`

### cache

Enable template cache, most likely to be disabled during UI development.

Available options:

- `true` (default)
- `false`

### breakpoints

The breakpoints defined here will be shown in the preview settings.
Declare the breakpoints with the name as key and the minimum media query pixel being the value:

```js
breakpoints: {
  XS: 320,
  S: 560,
  M: 768,
  L: 960,
  XL: 1280
}
```

### viewports

The viewports defined here will be shown in the preview settings.
Declare the viewports with the name as key and the `width` (required) and `height` (optional) being the value:

```js
viewports: {
  Phone: {
    width: 320
  },
  Tablet: {
    width: 768
  },
  Desktop: {
    width: 1280
  }
}
```

If the height is defined, the preview container will be scrollable.
It the height is omitted, the preview content will define the height – just like with `breakpoints`.

### defaultPreviewMode

When viewports and breakpoints are defined, breakpoints take precedence.
You can also define `defaultPreviewMode: 'viewports'` to switch this default.

Available options:

- `breakpoints` (default)
- `viewports`

The preview mode can also be switched in the preference settings.

### themes

The themes defined here will be shown in the topbar.

The first theme is selected by default.
The iframe is loaded with the theme id being the hash part of the url (i.e. `#funky`).
