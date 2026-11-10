import { parse } from '@babel/parser'
// Test-side only: expectNoEnglish imports `vitest`, so never import this from app code.
import { ALLOWED_LATIN } from '../test/expectNoEnglish'

const ATTRS = new Set(['placeholder', 'title', 'aria-label', 'alt', 'label'])

function hasEnglish(text) {
  let s = text
  for (const re of ALLOWED_LATIN) s = s.replace(re, ' ')
  return /[A-Za-z]{3,}/.test(s)
}

// Returns [{ line, text }] for hardcoded English in JSX children and a few user-facing attributes.
export function scanJsx(source, file = '') {
  let ast
  try {
    ast = parse(source, { sourceType: 'module', plugins: ['jsx'], errorRecovery: true })
  } catch (e) {
    throw new Error(`scanJsx: cannot parse ${file}: ${e.message}`)
  }
  const found = []
  const add = (node, text) => {
    if (hasEnglish(text)) found.push({ line: node.loc.start.line, text: text.trim().replace(/\s+/g, ' ') })
  }
  const strOf = n => {
    if (!n) return null
    if (n.type === 'StringLiteral') return n.value
    if (n.type === 'TemplateLiteral' && n.expressions.length === 0) return n.quasis.map(q => q.value.cooked).join('')
    return null
  }
  const visit = (node, parent) => {
    if (!node || typeof node.type !== 'string') return
    // CSS inside <style>{`...`}</style> is not user-visible text.
    if (node.type === 'JSXElement' && node.openingElement.name.name === 'style') return
    // <Seo> props are head metadata (search-engine English), not on-page UI text.
    if (node.type === 'JSXElement' && node.openingElement.name.name === 'Seo') {
      node.children.forEach(c => visit(c, node))
      return
    }
    if (node.type === 'JSXText') {
      add(node, node.value)
    } else if (node.type === 'JSXExpressionContainer' && parent && (parent.type === 'JSXElement' || parent.type === 'JSXFragment')) {
      const s = strOf(node.expression)
      if (s !== null) add(node, s)
    } else if (node.type === 'JSXAttribute' && node.name.type === 'JSXIdentifier' && ATTRS.has(node.name.name)) {
      const v = node.value
      const s = v && v.type === 'JSXExpressionContainer' ? strOf(v.expression) : strOf(v)
      if (s !== null) add(node, s)
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'leadingComments' || key === 'trailingComments') continue
      const child = node[key]
      if (Array.isArray(child)) child.forEach(c => c && typeof c === 'object' && visit(c, node))
      else if (child && typeof child === 'object') visit(child, node)
    }
  }
  visit(ast.program, null)
  return found
}
