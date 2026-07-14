export interface TocItem {
  id:    string
  text:  string
  level: 2 | 3
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

const isHeading  = (l: string) => /^#{1,6}\s/.test(l)
const isFence    = (l: string) => l.trim().startsWith('```')
const isUl       = (l: string) => /^\s*[-*]\s+/.test(l)
const isOl       = (l: string) => /^\s*\d+\.\s+/.test(l)
const isQuote    = (l: string) => l.trim().startsWith('>')
const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l)

/** Minimal, dependency-free markdown → HTML renderer for /help/docs content. */
export function renderMarkdown(md: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  const lines = md.split('\n')
  const htmlParts: string[] = []
  let i = 0
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null
  let table: string[][] | null = null

  const flushList = () => {
    if (!list) return
    const tag = list.type
    htmlParts.push(`<${tag}>${list.items.map(it => `<li>${inline(it)}</li>`).join('')}</${tag}>`)
    list = null
  }

  const flushTable = () => {
    if (!table || table.length === 0) return
    const [header, ...rows] = table
    htmlParts.push(
      '<table><thead><tr>' + header.map(h => `<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>' +
      rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
      '</tbody></table>'
    )
    table = null
  }

  while (i < lines.length) {
    const line = lines[i]

    if (isFence(line)) {
      flushList(); flushTable()
      const code: string[] = []
      i++
      while (i < lines.length && !isFence(lines[i])) { code.push(lines[i]); i++ }
      i++
      htmlParts.push(`<pre><code>${code.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      flushList(); flushTable()
      const level = heading[1].length
      const text  = heading[2].trim()
      const id    = slugify(text)
      if (level === 2 || level === 3) toc.push({ id, text, level })
      htmlParts.push(`<h${level} id="${id}">${inline(text)}</h${level}>`)
      i++
      continue
    }

    if (isTableRow(line) && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1] ?? '')) {
      flushList()
      table = [line.split('|').map(c => c.trim()).filter(Boolean)]
      i += 2
      while (i < lines.length && isTableRow(lines[i])) {
        table.push(lines[i].split('|').map(c => c.trim()).filter(Boolean))
        i++
      }
      flushTable()
      continue
    }

    if (isQuote(line)) {
      flushList(); flushTable()
      const quote: string[] = []
      while (i < lines.length && isQuote(lines[i])) { quote.push(lines[i].trim().replace(/^>\s?/, '')); i++ }
      htmlParts.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`)
      continue
    }

    if (isUl(line)) {
      flushTable()
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] } }
      list.items.push(line.replace(/^\s*[-*]\s+/, ''))
      i++
      continue
    }

    if (isOl(line)) {
      flushTable()
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] } }
      list.items.push(line.replace(/^\s*\d+\.\s+/, ''))
      i++
      continue
    }

    if (line.trim() === '') {
      flushList(); flushTable()
      i++
      continue
    }

    flushList(); flushTable()
    const para = [line]
    i++
    while (
      i < lines.length && lines[i].trim() !== '' &&
      !isHeading(lines[i]) && !isFence(lines[i]) && !isUl(lines[i]) &&
      !isOl(lines[i]) && !isQuote(lines[i]) && !isTableRow(lines[i])
    ) {
      para.push(lines[i]); i++
    }
    htmlParts.push(`<p>${inline(para.join(' '))}</p>`)
  }
  flushList(); flushTable()

  return { html: htmlParts.join('\n'), toc }
}
