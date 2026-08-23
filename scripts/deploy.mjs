import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
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

function remoteUrl() {
  return execSync('git remote get-url origin', { cwd: root, encoding: 'utf-8' }).trim()
}

function run(cmd, cwd) {
  console.log(cmd)
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Ron Picard',
      GIT_AUTHOR_EMAIL: 'ronpicard@users.noreply.github.com',
      GIT_COMMITTER_NAME: 'Ron Picard',
      GIT_COMMITTER_EMAIL: 'ronpicard@users.noreply.github.com',
    },
  })
}

const base = `/${repoSlug()}/`
run(`npx vite build --base=${base}`, root)
writeFileSync(join(root, 'dist', '.nojekyll'), '')

// Publish from an isolated temp repo so we never touch the main working tree.
const tmp = mkdtempSync(join(tmpdir(), 'apcs-pages-'))
try {
  cpSync(join(root, 'dist'), tmp, { recursive: true })
  run('git init -b gh-pages', tmp)
  run('git add -A', tmp)
  run('git commit -m "Deploy Vite build to GitHub Pages"', tmp)
  run(`git remote add origin ${remoteUrl()}`, tmp)
  run('git push -f origin gh-pages', tmp)
  console.log('Published clean dist/ to origin/gh-pages')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
