import { parse } from './parser'

function compile (name, code, config) {
  config = config || {}
  config.prependRequire = config.prependRequire === true

  const results = {}
  const elements = {}
  parse(name, code, results, elements, config)

  return results
}

module.exports = compile
