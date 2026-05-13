import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Extract all entries with characters from the game-data.ts file
const content = readFileSync(resolve(__dirname, '../src/lib/game-data.ts'), 'utf-8')

// Find all character names and their positions
const characterRegex = /character:\s*'([^']+)'/g
const matches = [...content.matchAll(characterRegex)]
const characterNames = matches.map(m => m[1])
const uniqueNames = [...new Set(characterNames)]

console.log(`Found ${uniqueNames.length} unique characters to look up on Shikimori...`)

const UA = 'MovieBattle/1.0 (populate-script)'

async function lookupCharacter(name) {
  // Try Shikimori API
  try {
    const url = `https://shikimori.one/api/characters?search=${encodeURIComponent(name)}&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data && data.length > 0 && data[0].id) {
        const imageUrl = `https://shikimori.one/system/characters/original/${data[0].id}.jpg`
        console.log(`  ✓ ${name} → ID ${data[0].id}`)
        return imageUrl
      }
    }
  } catch {}
  console.log(`  ✗ ${name} → not found on Shikimori`)
  return null
}

async function main() {
  const results = {}

  for (let i = 0; i < uniqueNames.length; i++) {
    const name = uniqueNames[i]
    process.stdout.write(`[${i + 1}/${uniqueNames.length}] ${name}... `)
    const url = await lookupCharacter(name)
    results[name] = url
    // Delay between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 300))
  }

  // Build the characterImage map
  const mapEntries = Object.entries(results).filter(([_, v]) => v !== null)
  console.log(`\nFound images for ${mapEntries.length}/${uniqueNames.length} characters`)

  // Generate updated game-data.ts content
  let updatedContent = content

  // For each character that has an image, add characterImage field after the character field
  for (const [name, url] of mapEntries) {
    const searchPattern = `character: '${name}'`
    const replacePattern = `character: '${name}', characterImage: '${url}'`
    updatedContent = updatedContent.replace(searchPattern, replacePattern)
  }

  writeFileSync(resolve(__dirname, '../src/lib/game-data.ts'), updatedContent, 'utf-8')
  console.log(`\nWritten updated game-data.ts with ${mapEntries.length} character images`)
}

main().catch(console.error)
