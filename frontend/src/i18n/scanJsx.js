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
  // Collect every string literal an expression can evaluate to (branches of ?:, operands of && || ??).
  const strsOf = n => {
    if (!n) return []
    if (n.type === 'StringLiteral') return [n]
    if (n.type === 'TemplateLiteral' && n.expressions.length === 0) return [n]
    if (n.type === 'ConditionalExpression') return [...strsOf(n.consequent), ...strsOf(n.alternate)]
    if (n.type === 'LogicalExpression') return [...strsOf(n.left), ...strsOf(n.right)]
    if (n.type === 'ParenthesizedExpression') return strsOf(n.expression)
    return []
  }
  const textOf = n => (n.type === 'StringLiteral' ? n.value : n.quasis.map(q => q.value.cooked).join(''))
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
      strsOf(node.expression).forEach(n => add(n, textOf(n)))
    } else if (node.type === 'JSXAttribute' && node.name.type === 'JSXIdentifier' && ATTRS.has(node.name.name)) {
      const v = node.value
      strsOf(v && v.type === 'JSXExpressionContainer' ? v.expression : v).forEach(n => add(n, textOf(n)))
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
