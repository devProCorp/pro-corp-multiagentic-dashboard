import fs from 'fs'
import path from 'path'
import { parseMarkdownFile } from './fileParser.js'

const PROJECT_ROOT = path.resolve(process.cwd(), '..', '..')

export function loadAllCampaigns() {
  const campaignsDir = path.join(PROJECT_ROOT, 'campaigns')
  if (!fs.existsSync(campaignsDir)) return []

  const campaigns = []
  const clients = fs.readdirSync(campaignsDir).filter(f =>
    fs.statSync(path.join(campaignsDir, f)).isDirectory()
  )

  for (const client of clients) {
    const clientDir = path.join(campaignsDir, client)
    const campaignDirs = fs.readdirSync(clientDir).filter(f =>
      fs.statSync(path.join(clientDir, f)).isDirectory()
    )

    for (const campaignId of campaignDirs) {
      const campaign = loadCampaign(client, campaignId)
      if (campaign) campaigns.push(campaign)
    }
  }

  return campaigns
}

export function loadCampaign(client, campaignId) {
  const campaignDir = path.join(PROJECT_ROOT, 'campaigns', client, campaignId)
  if (!fs.existsSync(campaignDir)) return null

  const files = fs.readdirSync(campaignDir).filter(f => f.endsWith('.md'))
  const documents = []
  let campaignName = campaignId
  let status = 'PENDING'
  let fecha = null

  for (const file of files) {
    const filePath = path.join(campaignDir, file)
    const { data, content } = parseMarkdownFile(filePath)

    documents.push({
      fileName: file,
      path: `/campaigns/${client}/${campaignId}/${file}`,
      ...data,
    })

    if (data.campana) campaignName = data.campana
    if (data.estado) status = data.estado
    if (data.fecha) fecha = data.fecha
  }

  // Also check data/research for related files
  const researchDir = path.join(PROJECT_ROOT, 'data', 'research', client)
  if (fs.existsSync(researchDir)) {
    const researchFiles = fs.readdirSync(researchDir).filter(f =>
      f.startsWith(campaignId) && f.endsWith('.md')
    )
    for (const file of researchFiles) {
      const filePath = path.join(researchDir, file)
      const { data } = parseMarkdownFile(filePath)
      documents.push({
        fileName: file,
        path: `/data/research/${client}/${file}`,
        ...data,
      })
    }
  }

  return {
    id: campaignId,
    client,
    name: campaignName,
    status,
    fecha,
    documents,
    documentCount: documents.length,
  }
}
