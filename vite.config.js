import { createReadStream, cpSync, existsSync, mkdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const espeakSrc = path.join(
  rootDir,
  'node_modules/@spelling-creator/spellophone/espeak-ng-data',
)
const ESPEAK_FILES = ['manifest.json', 'core.bin.gz', 'en_dict.gz']

function copyEspeakData(dest) {
  if (!existsSync(espeakSrc)) return
  mkdirSync(dest, { recursive: true })
  for (const file of ESPEAK_FILES) {
    const from = path.join(espeakSrc, file)
    if (existsSync(from)) cpSync(from, path.join(dest, file))
  }
}

function espeakDataPlugin() {
  return {
    name: 'espeak-ng-data',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        if (!url.startsWith('/espeak-ng-data/')) return next()
        const rel = decodeURIComponent(url.slice('/espeak-ng-data/'.length))
        if (!rel || rel.includes('..') || path.isAbsolute(rel)) return next()
        const file = path.join(espeakSrc, rel)
        if (!existsSync(file) || !statSync(file).isFile()) return next()
        const type = file.endsWith('.json')
          ? 'application/json; charset=utf-8'
          : 'application/gzip'
        res.setHeader('Content-Type', type)
        createReadStream(file).pipe(res)
      })
    },
    buildStart() {
      copyEspeakData(path.join(rootDir, 'public/espeak-ng-data'))
    },
    writeBundle() {
      copyEspeakData(path.join(rootDir, 'dist/espeak-ng-data'))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), espeakDataPlugin()],
  base: './',
})
