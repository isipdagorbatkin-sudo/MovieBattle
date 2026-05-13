import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const content = readFileSync(resolve(__dirname, '../src/lib/game-data.ts'), 'utf-8')

const characterRegex = /character:\s*'([^']+)'/g
const matches = [...content.matchAll(characterRegex)]
const characterNames = matches.map(m => m[1])
const uniqueNames = [...new Set(characterNames)]

console.log(`Found ${uniqueNames.length} unique characters to look up...`)

async function lookupCharacter(name) {
  try {
    const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(name)}&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MovieBattle/1.0', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.data?.[0]?.images?.jpg?.image_url) {
        const img = data.data[0].images.jpg.image_url
        console.log(`  ✓ ${name} → ${img}`)
        return img
      }
    }
  } catch {}
  console.log(`  ✗ ${name} → not found`)
  return null
}

async function main() {
  const results = {}

  for (let i = 0; i < uniqueNames.length; i++) {
    const name = uniqueNames[i]
    process.stdout.write(`[${i + 1}/${uniqueNames.length}] ${name}... `)
    const url = await lookupCharacter(name)
    results[name] = url
    await new Promise(r => setTimeout(r, 350))
  }

  const mapEntries = Object.entries(results).filter(([_, v]) => v !== null)
  console.log(`\nFound images for ${mapEntries.length}/${uniqueNames.length} characters`)

  let updatedContent = content
  for (const [name, url] of mapEntries) {
    updatedContent = updatedContent.replace(
      `character: '${name}'`,
      `character: '${name}', characterImage: '${url}'`
    )
  }

  writeFileSync(resolve(__dirname, '../src/lib/game-data.ts'), updatedContent, 'utf-8')
  console.log(`\nWritten updated game-data.ts with ${mapEntries.length} character images`)
}

main().catch(console.error)
