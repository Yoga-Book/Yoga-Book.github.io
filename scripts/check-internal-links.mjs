import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

const siteRoot = resolve(process.argv[2] ?? 'build/site')

if (!existsSync(siteRoot)) {
  console.error(`Site directory does not exist: ${siteRoot}`)
  process.exit(1)
}

function walk(directory) {
  return readdirSync(directory)
    .flatMap((name) => {
      const path = join(directory, name)
      return statSync(path).isDirectory() ? walk(path) : [path]
    })
}

function decode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const htmlFiles = walk(siteRoot).filter((path) => path.endsWith('.html'))
const failures = []
let references = 0

for (const source of htmlFiles) {
  const html = readFileSync(source, 'utf8')
  const links = html.matchAll(/(?:href|src)="([^"]+)"/g)

  for (const [, reference] of links) {
    if (
      reference === '' ||
      /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)
    ) {
      continue
    }

    references += 1
    const [rawPath, rawFragment] = reference.split('#', 2)
    const cleanPath = decode(rawPath.split(/[?]/, 1)[0])
    let target = cleanPath === ''
      ? source
      : cleanPath.startsWith('/')
        ? join(siteRoot, cleanPath)
        : resolve(dirname(source), cleanPath)

    if (target.endsWith(sep) || (existsSync(target) && statSync(target).isDirectory())) {
      target = join(target, 'index.html')
    }

    const relativeTarget = relative(siteRoot, target)
    if (relativeTarget === '..' || relativeTarget.startsWith(`..${sep}`)) {
      failures.push(`${relative(siteRoot, source)}: link escapes site root ${reference}`)
      continue
    }

    if (!existsSync(target)) {
      failures.push(`${relative(siteRoot, source)}: missing ${reference}`)
      continue
    }

    if (rawFragment && target.endsWith('.html')) {
      const fragment = decode(rawFragment)
      const targetHtml = target === source ? html : readFileSync(target, 'utf8')
      if (!targetHtml.includes(`id="${fragment}"`)) {
        failures.push(`${relative(siteRoot, source)}: missing anchor ${reference}`)
      }
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Checked ${references} internal references across ${htmlFiles.length} HTML pages.`)

