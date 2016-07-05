import parse5 from 'parse5'

export function parse (code, done) {
  const doc = parse5.parseFragment(code, {
    treeAdapter: parse5.treeAdapters.default,
    locationInfo: true
  })

  // doc: #document-fragment
  // doc.childNodes: [template, style, ...]
  const result = []
  doc.childNodes.forEach((child) => {
    let start, end, line, column

    if (child.__location) {
      const __location = child.__location
      if (__location.startTag && __location.endTag) {
        start = __location.startTag.endOffset || 0
        end = __location.endTag.startOffset || 0
      }
      else {
        start = __location.startOffset || 0
        end = __location.endOffset || 0
      }
      line = __location.line
      column = __location.col
    }
    /* istanbul ignore else */
    else {
      start = end = line = column = 0
    }

    const childResult = {
      type: child.nodeName,
      start,
      end,
      line,
      column,
      content: code.substring(start, end)
    }

    if (child.attrs && child.attrs.length) {
      child.attrs.forEach((item) => {
        childResult[item.name] = item.value
      })
    }

    result.push(childResult)
  })

  done(null, result)
}

export function format (code, done) {
  const result = {}
  parse(code, (err, blocks) => {
    /* istanbul ignore if */
    if (err) {
      // console.log('no err discovered in `parse`')
    }

    blocks.forEach((block) => {
      switch (block.type) {
        case 'template':
        case 'config':
        case 'data':
          if (!result[block.type]) {
            result[block.type] = block
          }
          break
        case 'style':
          if (!result.styles) {
            result.styles = []
          }
          result.styles.push(block)
          break
        case 'script':
          if (!result.scripts) {
            result.scripts = []
          }
          result.scripts.push(block)
          break
        case 'element':
        case 'wx-element':
        case 'wa-element':
        case 'we-element':
          if (!result.elements) {
            result.elements = {}
          }
          result.elements[block.name] = block
          break
        default:
          // console.log('unknown block type')
          break
      }
    })

    done(null, result)
  })
}
