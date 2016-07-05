# Weex DSL compiler

`<template>` + `<style>` + `<script>` + `<element>`

## Usage

### API

#### `compile(name, code, config)`

```javascript
var compiler = require('weex-compiler')
var output = compiler.compile('foo', '/* DSL code here */')
```

##### params

- `name`: string, current bundle name
- `code`: string, source code
- `config`: object *optional*
    * `prependRequire`: whether to prepend `deps` as requires in `<script>` (default: false)

##### returns

- an object with keys
    * `name`: string, current bundle name
    * `generatedCode`: string, generated code of current bundle
    * `elements`: array, list of generated bundle objects
    * `deps`: array, template tags
    * `logs`: array, corresponding warning & error logs
    * `data`: object, data specified in `<script type="data">`
    * `config`: object, config info specified in `<script type="config">`

## transforming content

- `template`: JavaScript Object by `parse5`
- `style`: JSON Object by `css`
- `script`: JavaScript AST with `template`, `deps`, `style` by `esprima`
- `element`: string code map for deeply parsing
