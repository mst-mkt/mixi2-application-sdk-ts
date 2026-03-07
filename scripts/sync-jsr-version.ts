import { readFileSync, writeFileSync } from 'node:fs'

import { format } from 'oxfmt'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const jsr = JSON.parse(readFileSync('jsr.json', 'utf8'))

jsr.version = pkg.version

const updated = JSON.stringify(jsr, null, 2) + '\n'
const { code: formatted } = await format('jsr.json', updated)

writeFileSync('jsr.json', formatted)
