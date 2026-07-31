/**
 * Keep index.html as the Vite entry locally; CI may overwrite it with the
 * production build for GitHub Pages (branch → root).
 */
import { copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'index.vite.html')
const dest = join(root, 'index.html')

if (!existsSync(src)) {
  console.error('Missing index.vite.html')
  process.exit(1)
}

copyFileSync(src, dest)
console.log('Restored index.html from index.vite.html')
