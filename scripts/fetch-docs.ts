import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const DOC_TOP_URL = 'https://developer.mixi.social'
const HEADING_PATH_PATTERN = /^# .+ \((.+)\)$/
const OUTPUT_DIR = './docs/_internal'

const getDocPaths = async (): Promise<string[]> => {
  const res = await fetch(`${DOC_TOP_URL}/docs/llms-full.txt`)
  if (!res.ok) throw new Error(`Failed to fetch llms-full.txt: ${res.status}`)
  const llmsFullText = await res.text()

  return llmsFullText.split('\n').flatMap((line) => {
    const match = HEADING_PATH_PATTERN.exec(line)
    return match?.[1] !== undefined && match[1] !== '/docs/' ? [match[1]] : []
  })
}

const getDocContent = async (path: string): Promise<string> => {
  const res = await fetch(`${DOC_TOP_URL}${path}.mdx`)
  if (!res.ok) throw new Error(`Failed to fetch ${path}.mdx: ${res.status}`)
  return await res.text()
}

const saveDoc = async (path: string, content: string): Promise<void> => {
  const filePath = join(OUTPUT_DIR, `${path.replace(/^\/docs\//, 'mixi2/')}.md`)
  await mkdir(dirname(filePath), { recursive: true })
  await writeFile(filePath, content)
}

const docPaths = await getDocPaths()
await Promise.all(
  docPaths.map(async (path) => {
    const content = await getDocContent(path)
    await saveDoc(path, content)
    console.log(`Saved: ${path}`)
  }),
)
