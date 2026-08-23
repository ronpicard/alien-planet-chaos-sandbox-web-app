import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'))

function repoSlug() {
  const url = pkg.repository?.url
  if (typeof url !== 'string') {
    throw new Error(
      'Add "repository": { "url": "https://github.com/<you>/<repo>.git" } to package.json',
    )
  }
  const m = url.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?$/i)
  if (!m) {
    throw new Error(`Could not parse repo name from repository.url: ${url}`)
  }
  return m[2]
}

const base = `/${repoSlug()}/`
console.log(`vite build --base=${base}`)
execSync(`npx vite build --base=${base}`, { stdio: 'inherit', cwd: root })
console.log('gh-pages -d dist')
execSync('npx gh-pages -d dist', { stdio: 'inherit', cwd: root })
