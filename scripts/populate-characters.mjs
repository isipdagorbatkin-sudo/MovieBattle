import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const gameDataPath = resolve(__dirname, '../src/lib/game-data.ts')
const namesPath = resolve(__dirname, '../src/lib/character-names.ts')

const content = readFileSync(gameDataPath, 'utf-8')
const namesContent = readFileSync(namesPath, 'utf-8')

// Parse CHARACTER_NAME_MAP from character-names.ts
const nameMap = {}
const nameRegex = /'([^']+)':\s*'([^']+)'/g
for (const m of namesContent.matchAll(nameRegex)) {
  nameMap[m[1]] = m[2]
}

// Skip lines that already have characterImage
const linesWithoutImage = content.split('\n').filter(line => line.includes("character:") && !line.includes("characterImage:"))
const characterRegex = /character:\s*'([^']+)'/g
const matches = linesWithoutImage.join('\n').matchAll(characterRegex)
const characterNames = [...matches].map(m => m[1])
const uniqueNames = [...new Set(characterNames)]

console.log(`Found ${uniqueNames.length} unique characters to look up...`)

async function lookupCharacter(name) {
  const englishName = nameMap[name] || name
  try {
    const url = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(englishName)}&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MovieBattle/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.data?.[0]?.images?.jpg?.image_url) {
        console.log(`  ✓ ${name} (${englishName})`)
        return data.data[0].images.jpg.image_url
      }
    }
  } catch {}
  console.log(`  ✗ ${name} (${englishName})`)
  return null
}

async function main() {
  const results = {}
  for (let i = 0; i < uniqueNames.length; i++) {
    const name = uniqueNames[i]
    process.stdout.write(`[${i + 1}/${uniqueNames.length}] ${name}... `)
    results[name] = await lookupCharacter(name)
    await new Promise(r => setTimeout(r, 350))
  }

  const mapEntries = Object.entries(results).filter(([_, v]) => v !== null)
  console.log(`\nFound images for ${mapEntries.length}/${uniqueNames.length} characters`)

  let updatedContent = content
  for (const [name, url] of mapEntries) {
    const search = `character: '${name}'`
    const replace = `character: '${name}', characterImage: '${url}'`
    if (updatedContent.includes(search)) {
      updatedContent = updatedContent.replace(search, replace)
    }
  }

  writeFileSync(gameDataPath, updatedContent, 'utf-8')
  console.log(`Written updated game-data.ts with ${mapEntries.length} character images`)
}

main().catch(console.error)
