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
  const outputBase = options.output || 'archive'
  const outputPath = path.resolve(cwd, outputBase.endsWith('.zip') ? outputBase : `${outputBase}.zip`)

  // Normalize targets
  const targets = (Array.isArray(options.target) ? options.target : [options.target || 'dist'])
    .filter(Boolean) as string[]

  // Validate that each target exists and is a directory
  const absTargets = targets.map(t => path.resolve(cwd, t))
  for (const abs of absTargets) {
    if (!fssync.existsSync(abs) || !fssync.statSync(abs).isDirectory())
      throw new Error(`Target directory not found: ${abs}`)
  }

  // Build glob patterns
  const includePatterns = (options.include && options.include.length > 0)
    ? options.include
    : ['**/*']
  const excludePatterns = options.exclude || []

  const zip = new JSZip()

  // If multiple targets, we namespace files under their relative path to cwd
  // (or basename if outside cwd) to avoid collisions.
  const doNamespace = options.namespace !== false && absTargets.length > 1

  for (let i = 0; i < absTargets.length; i++) {
    const targetDir = absTargets[i]

    const relFromCwd = path.relative(cwd, targetDir)
    const namespace = doNamespace
      ? (relFromCwd && !relFromCwd.startsWith('..') && !path.isAbsolute(relFromCwd))
          ? relFromCwd
          : path.basename(targetDir)
      : ''

    // Collect files (only files, no directories) for this target
    const entries = await glob(includePatterns, {
      cwd: targetDir,
      dot: true, // include dotfiles unless explicitly excluded
      ignore: excludePatterns,
      onlyFiles: true,
      followSymbolicLinks: true,
    })

    for (const rel of entries) {
      const abs = path.join(targetDir, rel)
      const stat = await fs.stat(abs)
      if (!stat.isFile())
        continue
      const data = await fs.readFile(abs)
      const archivePath = namespace ? path.join(namespace, rel) : rel
      zip.file(archivePath, data, { date: stat.mtime })
    }
  }

  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  const compression = !options.compressionLevel ? 'STORE' : 'DEFLATE'

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression,
    compressionOptions: compression === 'DEFLATE' ? { level: options.compressionLevel! } : undefined,
  })

  await fs.writeFile(outputPath, content)
}
