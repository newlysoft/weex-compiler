var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

var joiner = require('../lib/join')

describe('join', function () {
  it('join all together', function () {
    var template = {type: 'container', id: function () {return this.foo}}
    var styleList = [{classA: {a: 1, b: 2}}, {classA: {b: 4, c: 3}, classB: {e: 5}}]
    var scriptList = ['module.exports = {data: {foo: \'hello\'}}', 'var bar = 123']
    var deps = ['container', 'text', 'foo']

    var output = joiner.join('test', template, styleList, scriptList, deps, false)

    expect(output).eql('__weex_define__("@weex-component/test", function (__weex_require__, __weex_exports__, __weex_module__) {\n\
\n\
;__weex_module__.exports = {data: function () {return {foo: \'hello\'}}}\n\
\n\
;var bar = 123\n\
\n\
;__weex_module__.exports.style = __weex_module__.exports.style || {}\n\
;Object.assign(__weex_module__.exports.style, {\n\
  "classA": {\n\
    "a": 1,\n\
    "b": 4,\n\
    "c": 3\n\
  },\n\
  "classB": {\n\
    "e": 5\n\
  }\n\
})\n\
\n\
;__weex_module__.exports.template = __weex_module__.exports.template || {}\n\
;Object.assign(__weex_module__.exports.template, {\n\
  "type": "container",\n\
  "id": function () {return this.foo}\n\
})\n\
\n\
;})')
  })

  it('join with prepended require deps', function () {
    var template = {type: 'container', id: function () {return this.foo}}
    var styleList = [{classA: {a: 1, b: 2}}, {classA: {b: 4, c: 3}, classB: {e: 5}}]
    var scriptList = ['module.exports = {data: {foo: \'hello\'}}', 'var bar = 123']
    var deps = ['container', 'text', 'foo']

    var output = joiner.join('test', template, styleList, scriptList, deps, true)

    expect(output).eql('__weex_define__("@weex-component/test", function (__weex_require__, __weex_exports__, __weex_module__) {\n\
\n\
;require("./container");\n\
require("./text");\n\
require("./foo");\n\
__weex_module__.exports = {data: function () {return {foo: \'hello\'}}}\n\
\n\
;var bar = 123\n\
\n\
;__weex_module__.exports.style = __weex_module__.exports.style || {}\n\
;Object.assign(__weex_module__.exports.style, {\n\
  "classA": {\n\
    "a": 1,\n\
    "b": 4,\n\
    "c": 3\n\
  },\n\
  "classB": {\n\
    "e": 5\n\
  }\n\
})\n\
\n\
;__weex_module__.exports.template = __weex_module__.exports.template || {}\n\
;Object.assign(__weex_module__.exports.template, {\n\
  "type": "container",\n\
  "id": function () {return this.foo}\n\
})\n\
\n\
;})')
  })

  it('join with existing requires', function () {
    var template = {type: 'container', id: function () {return this.foo}}
    var styleList = [{classA: {a: 1, b: 2}}, {classA: {b: 4, c: 3}, classB: {e: 5}}]
    var scriptList = ['require("./foo")\nrequire("@weex-module/loading")', 'module.exports = {data: {foo: \'hello\'}}', 'var bar = 123']
    var deps = ['container', 'text', 'foo']

    var output = joiner.join('test', template, styleList, scriptList, deps, true)

    expect(output).eql('__weex_define__("@weex-component/test", function (__weex_require__, __weex_exports__, __weex_module__) {\n\
\n\
;require("./container");\n\
require("./text");\n\
require("./foo")\n\
__weex_require__("@weex-module/loading")\n\
\n\
;__weex_module__.exports = {data: function () {return {foo: \'hello\'}}}\n\
\n\
;var bar = 123\n\
\n\
;__weex_module__.exports.style = __weex_module__.exports.style || {}\n\
;Object.assign(__weex_module__.exports.style, {\n\
  "classA": {\n\
    "a": 1,\n\
    "b": 4,\n\
    "c": 3\n\
  },\n\
  "classB": {\n\
    "e": 5\n\
  }\n\
})\n\
\n\
;__weex_module__.exports.template = __weex_module__.exports.template || {}\n\
;Object.assign(__weex_module__.exports.template, {\n\
  "type": "container",\n\
  "id": function () {return this.foo}\n\
})\n\
\n\
;})')
  })
})
