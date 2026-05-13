import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const content = readFileSync(resolve(__dirname, '../src/lib/game-data.ts'), 'utf-8')

// Skip lines that already have characterImage
const linesWithoutImage = content.split('\n').filter(line => line.includes("character:") && !line.includes("characterImage:"))
const characterRegex = /character:\s*'([^']+)'/g
const matches = linesWithoutImage.join('\n').matchAll(characterRegex)
const characterNames = [...matches].map(m => m[1])
const uniqueNames = [...new Set(characterNames)]

console.log(`Found ${uniqueNames.length} unique characters to look up...`)

// Russian → English name mapping
const NAME_MAP = {
  'Айсака Тайга': 'Taiga Aisaka',
  'Тайга Айсака': 'Taiga Aisaka',
  'Томоя Окадзаки': 'Tomoya Okazaki',
  'Косэй Арима': 'Kousei Arima',
  'Кагуя Синомия': 'Kaguya Shinomiya',
  'Тору Хонда': 'Tohru Honda',
  'Хори Кёко': 'Kyoko Hori',
  'Хатиман Хикигая': 'Hachiman Hikigaya',
  'Сакута Адзусагава': 'Sakuta Azusagawa',
  'Сорота Канда': 'Sorata Kanda',
  'Сёя Исида': 'Shoya Ishida',
  'Мицуха Миямидзу': 'Mitsuha Miyamizu',
  'Вайолет Эвергарден': 'Violet Evergarden',
  'Инуяся': 'Inuyasha',
  'Сон Ги-хун': 'Seong Gi-hun',
  'Одиннадцать': 'Eleven',
  'Рик Граймс': 'Rick Grimes',
  'Геральт': 'Geralt of Rivia',
  'Уэнсдей': 'Wednesday Addams',
  'Джоэл': 'Joel Miller',
  'Джон Сноу': 'Jon Snow',
  'Уолтер Уайт': 'Walter White',
  'Сол Гудман': 'Saul Goodman',
  'Грегори Хаус': 'Gregory House',
  'Шерлок Холмс': 'Sherlock Holmes',
  'Дин Винчестер': 'Dean Winchester',
  'Фокс Малдер': 'Fox Mulder',
  'Шелдон Купер': 'Sheldon Cooper',
  'Рейчел Грин': 'Rachel Green',
  'Майкл Скотт': 'Michael Scott',
  'Тед Мосби': 'Ted Mosby',
  'Рю': 'Rue Bennett',
  'Фрэнк Андервуд': 'Frank Underwood',
  'Пабло Эскобар': 'Pablo Escobar',
  'Тони Сопрано': 'Tony Soprano',
  'Дейл Купер': 'Dale Cooper',
  'Мандалорец': 'The Mandalorian',
  'Локи': 'Loki (Marvel)',
  'Декстер': 'Dexter Morgan',
  'Профессор': 'Professor (Money Heist)',
}

async function lookupCharacter(name) {
  const englishName = NAME_MAP[name] || name
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

  writeFileSync(resolve(__dirname, '../src/lib/game-data.ts'), updatedContent, 'utf-8')
  console.log(`Written updated game-data.ts with ${mapEntries.length} character images`)
}

main().catch(console.error)
