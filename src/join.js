import path from 'path'
import scripter from 'weex-scripter'
import { extend } from './util'

const MODULE_EXPORTS_REG = /module\.exports/g
const REQUIRE_REG = /require\((["'])(@weex\-module\/[^\)\1]+)\1\)/g

function depNeedRequired (content, dep) {
  return !content.match(new RegExp('require\\(["\']./' + path.basename(dep) + '(.we)?["\']\\)', 'g'))
}

function mergeStyle (dest, src) {
  for (const className in src) {
    if (dest[className]) {
      extend(dest[className], src[className])
    }
    else {
      dest[className] = src[className]
    }
  }
}

function markFunc (k, v) {
  if (typeof v === 'function') {
    return '###FUNCTION_START' + v.toString() + 'FUNCTION_END###'
  }
  return v
}

function remarkFunc (code) {
  return code.replace(/"###FUNCTION_START/g, '').replace(/FUNCTION_END###"/g, '')
}

export function join (name, template, styleList, scriptList, deps, prependRequire) {
  let scriptCode = scriptList.map(scripter.fix).join('\n\n;')

  if (prependRequire) {
    const requireCode = deps.map((dep) =>
      depNeedRequired(scriptCode, dep) ? 'require("./' + dep + '");' : ''
    ).filter((r) => r).join('\n')
    scriptCode = requireCode + '\n' + scriptCode
  }

  scriptCode = scriptCode
      .replace(MODULE_EXPORTS_REG, '__weex_module__.exports')
      .replace(REQUIRE_REG, '__weex_require__($1$2$1)')

  const style = {}
  styleList.forEach((s) => {
    mergeStyle(style, s)
  })

  const templateCode = '__weex_module__.exports.template = __weex_module__.exports.template || {}' +
      '\n;Object.assign(__weex_module__.exports.template, ' +
      remarkFunc(JSON.stringify(template, markFunc, 2)) + ')'
  const styleCode = '__weex_module__.exports.style = __weex_module__.exports.style || {}' +
      '\n;Object.assign(__weex_module__.exports.style, ' + JSON.stringify(style, null, 2) + ')'

  return [
    '__weex_define__("@weex-component/' + name + '", function (__weex_require__, __weex_exports__, __weex_module__) {',
    scriptCode,
    styleCode,
    templateCode,
    '})'
  ].join('\n\n;')
}
