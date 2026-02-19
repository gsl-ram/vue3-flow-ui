/**
 * Lightweight EJS syntax validator for browser use.
 * Validates tag balance and JS inside scriptlets without node:fs dependency.
 */
export function validateEjs(text: string): { valid: boolean; error?: string } {
  if (!text.trim()) {
    return { valid: true }
  }

  try {
    let i = 0
    const len = text.length

    while (i < len) {
      const openIdx = text.indexOf('<%', i)
      if (openIdx === -1) break

      const afterOpen = openIdx + 2
      if (afterOpen >= len) {
        return { valid: false, error: 'Unclosed EJS tag at end' }
      }

      const firstChar = text[afterOpen]
      const isExpr = firstChar === '=' || firstChar === '-'
      const isComment = firstChar === '#'
      const tagStart = isExpr || isComment ? afterOpen + 1 : afterOpen

      const closeIdx = text.indexOf('%>', tagStart)
      if (closeIdx === -1) {
        return { valid: false, error: 'Unclosed EJS tag' }
      }

      const block = text.slice(tagStart, closeIdx).trim()
      if (block.length > 0 && !isComment) {
        try {
          if (isExpr) {
            new Function(`return (${block})`)
          } else {
            new Function(block)
          }
        } catch (e) {
          return { valid: false, error: (e as Error).message }
        }
      }

      i = closeIdx + 2
    }

    return { valid: true }
  } catch (e) {
    return { valid: false, error: (e as Error).message }
  }
}
