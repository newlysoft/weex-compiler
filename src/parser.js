import templater from 'weex-templater'
import styler from 'weex-styler'
import { format } from './blocker'
import { join } from './join'
import { extend } from './util'

function getTemplate (name, templateBlock, deps, logs, element) {
  const code = templateBlock.content
  let jsonTemplate

  templater.parse(code, (err, result) => {
    /* istanbul ignore if */
    if (err) {
      // console.log('no err discovered in `parse5` in `weex-templater`')
    }

    jsonTemplate = result.jsonTemplate
    result.deps && result.deps.forEach((name) => {
      deps.push(name)
    })
    result.log && result.log.forEach((log) => {
      log.name = name
      if (log.line === 1) {
        log.column += templateBlock.start
      }
      log.line += templateBlock.line - 1
      if (element && element.line) {
        log.line += element.line - 1
      }
      logs.push(log)
    })
  })

  return jsonTemplate
}

function getStyle (name, styleBlock, styleList, logs, element) {
  const code = styleBlock.content

  styler.parse(code, (err, result) => {
    /* istanbul ignore if */
    if (err) {
      // console.log('err has been put in log in `weex-style`')
    }

    styleList.push(result.jsonStyle)
    result.log && result.log.forEach((log) => {
      log.name = name
      if (log.line === 1) {
        log.column += styleBlock.start
      }
      log.line += styleBlock.line - 1
      if (element && element.line) {
        log.line += element.line - 1
      }
      logs.push(log)
    })
  })
}

function getScript (name, scriptBlock, scriptList, logs) {
  scriptList.push(scriptBlock.content)
  scriptBlock.log && scriptBlock.log.forEach((log) => {
    logs.push({
      name,
      reason: log.reason,
      line: scriptBlock.line,
      column: scriptBlock.column
    })
  })
}

export function parse (name, content, results, elements, config) {
  format(content, (err, result) => {
    /* istanbul ignore if */
    if (err) {
      // console.log('no err discovered in `blocker`')
    }

    let template = {}
    const styleList = []
    const scriptList = []
    const elementList = []
    const logs = []
    const deps = []

    extend(elements, result.elements)

    result.elements && Object.keys(result.elements).forEach((elName) => {
      parse(elName, elements[elName].content, elementList, elements, config)
    })

    if (result.template) {
      template = getTemplate(name, result.template, deps, logs, elements[name])
    }
    else {
      logs.push({
        name,
        reason: 'ERROR: should have a template tag',
        line: 1,
        column: 1
      })
    }

    result.styles && result.styles.forEach((style) => {
      getStyle(name, style, styleList, logs, elements[name])
    })

    result.scripts && result.scripts.forEach((script) => {
      getScript(name, script, scriptList, logs)
    })

    const generatedCode = join(name, template, styleList, scriptList, deps, config.prependRequire)

    const outputContent = {
      name,
      generatedCode,
      elements: elementList,
      logs,
      deps
    }

    const opts = ['data', 'config']
    opts.forEach((opt) => { // TODO: transformer Version ?
      if (result[opt]) {
        try {
          const content = result[opt].content.replace(/^\s*module.exports\s*=\s*/, '')
          outputContent[opt] = new Function('return ' + content.replace(/\n/g, ''))()
        }
        catch (e) {
          const { line, column } = result[opt]
          logs.push({
            name,
            reason: `ERROR: invalid json of \`${opt}\``,
            line,
            column
          })
        }
      }
    })

    if (Array.isArray(results)) { // put elements into elementList
      results.push(outputContent)
    }
    else {
      extend(results, outputContent)
    }
  })
}
