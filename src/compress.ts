import type { ZipxOptions } from './types'
import fssync from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import JSZip from 'jszip'
import { glob } from 'tinyglobby'

/**
 * Compress target directory into a zip file.
 *
 * Behaviour (assumptions):
 * - target is a directory (relative to cwd unless absolute) whose contents will be archived.
 * - include patterns (if provided) limit which files are added (relative to target root).
 * - exclude patterns are always ignored (relative to target root).
 * - output is a file path (relative to cwd unless absolute) without extension, unless it already ends with .zip.
 */
export async function compress(options: ZipxOptions): Promise<void> {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd()
  const targetDir = path.resolve(cwd, options.target || 'dist')
  const outputBase = options.output || 'archive'
  const outputPath = path.resolve(cwd, outputBase.endsWith('.zip') ? outputBase : `${outputBase}.zip`)

  // Validate target directory
  if (!fssync.existsSync(targetDir) || !fssync.statSync(targetDir).isDirectory())
    throw new Error(`Target directory not found: ${targetDir}`)

  // Build glob patterns
  const includePatterns = (options.include && options.include.length > 0)
    ? options.include
    : ['**/*']
  const excludePatterns = options.exclude || []

  // Collect files (only files, no directories)
  const entries = await glob(includePatterns, {
    cwd: targetDir,
    dot: true, // include dotfiles unless explicitly excluded
    ignore: excludePatterns,
    onlyFiles: true,
    followSymbolicLinks: true,
  })

  const zip = new JSZip()

  for (const rel of entries) {
    const abs = path.join(targetDir, rel)
    // Skip if for some reason it's a directory (defensive)
    const stat = await fs.stat(abs)
    if (!stat.isFile())
      continue
    const data = await fs.readFile(abs)
    zip.file(rel, data, { date: stat.mtime })
  }

  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  })

  await fs.writeFile(outputPath, content)

  // Simple feedback
  // eslint-disable-next-line no-console
  console.log(`Created ${path.relative(cwd, outputPath)} (${entries.length} files)`) // keep concise, CLI friendly
}
