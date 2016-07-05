var fs = require('fs')
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

function readFile (filepath) {
  if (fs.existsSync(filepath)) {
    return fs.readFileSync(filepath, {encoding: 'utf-8'}) || ''
  }
  return ''
}

var compiler = require('../')
var path = 'test/parse'

describe('parse', function () {

  it('parse single content', function () {
    var result = compiler.compile('single', readFile(path + '/single.html'))

    expect(result).is.an.object
    expect(result.name).is.a.string
    expect(result.name).eql('single')
    expect(result.generatedCode).is.a.string
    expect(result.generatedCode).eql(readFile(path + '/single.bundle'))
    expect(result.logs).is.an.array
    expect(result.logs.length).eql(1)
    expect(result.logs).eql([{name: 'single', line: 2, column: 3, reason: 'NOTE: property value `red` is autofixed to `#FF0000`'}])
    expect(result.deps).is.an.array
    expect(result.deps.length).eql(1)
    expect(result.deps).eql(['text'])
    expect(result.data).to.be.undefined
    expect(result.config).to.be.undefined
    expect(result.elements).is.an.array
    expect(result.elements.length).eql(0)
  })

  it('parse content with style', function () {
    var result = compiler.compile('style', readFile(path + '/style.html'))

    expect(result).is.an.object
    expect(result.name).is.a.string
    expect(result.name).eql('style')
    expect(result.generatedCode).is.a.string
    expect(result.generatedCode).eql(readFile(path + '/style.bundle'))
    expect(result.logs).is.an.array
    expect(result.logs.length).eql(2)
    expect(result.logs).eql([
      {name: 'style', line: 6, column: 11, reason: 'NOTE: property value `red` is autofixed to `#FF0000`'},
      {name: 'style', line: 6, column: 23, reason: 'NOTE: property value `48px` is autofixed to `48`'},
    ])
    expect(result.deps).is.an.array
    expect(result.deps.length).eql(1)
    expect(result.deps).eql(['text'])
    expect(result.data).to.be.undefined
    expect(result.config).to.be.undefined
    expect(result.elements).is.an.array
    expect(result.elements.length).eql(0)
  })

  it('parse content with javascript and prepend require', function () {
    var result = compiler.compile('require', readFile(path + '/require.html'), {prependRequire: true})

    expect(result).is.an.object
    expect(result.name).is.a.string
    expect(result.name).eql('require')
    expect(result.generatedCode).is.a.string
    expect(result.generatedCode).eql(readFile(path + '/require.bundle'))
    expect(result.logs).is.an.array
    expect(result.logs.length).eql(0)
    expect(result.deps).is.an.array
    expect(result.deps.length).eql(3)
    expect(result.deps).eql(['container', 'image', 'text'])
    expect(result.data).to.be.undefined
    expect(result.config).to.be.undefined
    expect(result.elements).is.an.array
    expect(result.elements.length).eql(0)
  })

  it('parse content with element', function () {
    var result = compiler.compile('element', readFile(path + '/element.html'))

    expect(result).is.an.object
    expect(result.name).is.a.string
    expect(result.name).eql('element')
    expect(result.generatedCode).is.a.string
    expect(result.generatedCode).eql(readFile(path + '/element.bundle'))
    expect(result.logs).is.an.array
    expect(result.logs.length).eql(0)
    expect(result.deps).is.an.array
    expect(result.deps.length).eql(2)
    expect(result.deps).eql(['container', 'taobao-item'])
    expect(result.data).to.be.undefined
    expect(result.config).to.be.undefined

    expect(result.elements).is.an.array
    expect(result.elements.length).eql(1)
    var elResult = result.elements[0]
    expect(elResult).is.an.object
    expect(elResult.name).is.a.string
    expect(elResult.name).eql('taobao-item')
    expect(elResult.generatedCode).is.a.string
    expect(elResult.generatedCode).eql(readFile(path + '/taobao-item.bundle'))
    expect(elResult.logs).is.an.array
    expect(elResult.logs.length).eql(0)
    expect(elResult.deps).is.an.array
    expect(elResult.deps.length).eql(3)
    expect(elResult.deps).eql(['container', 'image', 'text'])
    expect(elResult.data).to.be.undefined
    expect(elResult.config).to.be.undefined
  })

  it('parse content with config and data', function () {
    var result = compiler.compile('config', readFile(path + '/config.html'))

    expect(result).is.an.object
    expect(result.name).is.a.string
    expect(result.name).eql('config')
    expect(result.generatedCode).is.a.string
    expect(result.generatedCode).eql(readFile(path + '/config.bundle'))
    expect(result.logs).is.an.array
    expect(result.logs.length).eql(1)
    expect(result.logs).eql([
      {name: 'config', line: 2, column: 3, reason: 'NOTE: property value `column` is the DEFAULT value for `flex-direction` (could be removed)'}
    ])
    expect(result.deps).is.an.array
    expect(result.deps.length).eql(3)
    expect(result.deps).eql(['container', 'image', 'text'])
    expect(result.data).is.an.object
    expect(result.data).eql({itemList: [
      {itemId: '520421163634', title: '宝贝标题1', pictureUrl: 'https://gd2.alicdn.com/bao/uploaded/i2/T14H1LFwBcXXXXXXXX_!!0-item_pic.jpg'},
      {itemId: '522076777462', title: '宝贝标题2', pictureUrl: 'https://gd1.alicdn.com/bao/uploaded/i1/TB1PXJCJFXXXXciXFXXXXXXXXXX_!!0-item_pic.jpg'}
    ]})
    expect(result.config).is.an.object
    expect(result.config).eql({frameworkVersion: '0.13.6'})
    expect(result.elements).is.an.array
    expect(result.elements.length).eql(0)
  })
})
