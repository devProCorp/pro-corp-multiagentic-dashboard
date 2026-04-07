import fs from 'fs'
import matter from 'gray-matter'

export function parseMarkdownFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return { data, content, raw }
  } catch (err) {
    return { data: {}, content: '', raw: '' }
  }
}

export function parseSections(content) {
  const sections = {}
  let currentSection = '_intro'
  const lines = content.split('\n')

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)/)
    if (match) {
      currentSection = match[1].trim()
      sections[currentSection] = ''
    } else {
      sections[currentSection] = (sections[currentSection] || '') + line + '\n'
    }
  }

  return sections
}

export function parseListItems(text) {
  return (text || '')
    .split('\n')
    .filter(l => l.match(/^-\s/))
    .map(l => l.replace(/^-\s+/, '').trim())
}
