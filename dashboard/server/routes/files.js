import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { parseMarkdownFile } from '../services/fileParser.js'

const router = Router()
const PROJECT_ROOT = path.resolve(process.cwd(), '..', '..')

function safePath(requestedPath) {
  const resolved = path.resolve(PROJECT_ROOT, requestedPath.replace(/^\//, ''))
  if (!resolved.startsWith(PROJECT_ROOT)) return null
  return resolved
}

router.get('/', (req, res) => {
  const dir = req.query.path || ''
  const resolved = safePath(dir)
  if (!resolved || !fs.existsSync(resolved)) return res.status(404).json({ error: 'Not found' })

  if (fs.statSync(resolved).isDirectory()) {
    const items = fs.readdirSync(resolved).map(name => {
      const fullPath = path.join(resolved, name)
      const isDir = fs.statSync(fullPath).isDirectory()
      return { name, isDirectory: isDir, path: path.relative(PROJECT_ROOT, fullPath) }
    })
    res.json(items)
  } else {
    res.json({ error: 'Not a directory' })
  }
})

router.get('/content', (req, res) => {
  const filePath = req.query.path
  if (!filePath) return res.status(400).json({ error: 'path required' })

  const resolved = safePath(filePath)
  if (!resolved || !fs.existsSync(resolved)) return res.status(404).json({ error: 'File not found' })

  const { data, content } = parseMarkdownFile(resolved)
  res.json({ data, content, path: filePath })
})

export default router
