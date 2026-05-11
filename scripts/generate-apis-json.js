// This script generates /public/apis.json from the API catalog
// Run it before build: node scripts/generate-apis-json.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const apisPath = path.resolve(__dirname, '../src/data/apis.ts')
const content = fs.readFileSync(apisPath, 'utf-8')

// Extract all API entries from the TypeScript source
const apiPattern = /\{\s*id:\s*(\d+),\s*name:\s*'([^']+)',\s*description:\s*'([^']+)',\s*category:\s*'([^']+)',\s*url:\s*'([^']+)',\s*method:\s*'([^']+)',\s*auth:\s*'([^']+)',\s*rateLimit:\s*'([^']+)',\s*icon:\s*'([^']+)'(?:,\s*headers:\s*(\{[^}]+\}))?\s*\}/g

const apis = []
let match
while ((match = apiPattern.exec(content)) !== null) {
  const api = {
    id: parseInt(match[1]),
    name: match[2],
    description: match[3],
    category: match[4],
    url: match[5],
    method: match[6],
    auth: match[7],
    rateLimit: match[8],
    icon: match[9]
  }
  if (match[10]) {
    try {
      // Use JSON.parse instead of new Function() for safety
      api.headers = JSON.parse(match[10].replace(/(\w+)\s*:/g, '"$1":').replace(/'/g, '"'))
    } catch {
      // Fallback: try to parse as simple key-value
      try {
        const cleaned = match[10].replace(/'/g, '"')
        api.headers = JSON.parse(cleaned)
      } catch { /* skip malformed headers */ }
    }
  }
  apis.push(api)
}

const categories = [...new Set(apis.map(a => a.category))]

const catalog = {
  name: 'API Hub',
  version: '2.0.0',
  description: 'Curated collection of free public APIs for developers',
  total_apis: apis.length,
  total_categories: categories.length,
  generated_at: new Date().toISOString(),
  categories,
  apis
}

const outputPath = path.resolve(__dirname, '../public/apis.json')
fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2))

// Also regenerate sitemap.xml with current date
const today = new Date().toISOString().split('T')[0]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://api-hu.netlify.app/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml')
fs.writeFileSync(sitemapPath, sitemap)

console.log(`Generated apis.json: ${apis.length} APIs, ${categories.length} categories`)
console.log(`Updated sitemap.xml with lastmod: ${today}`)
