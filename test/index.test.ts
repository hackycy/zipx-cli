import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import JSZip from 'jszip'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { compress } from '../src/compress'

describe('should', () => {
  it('exported', () => {
    expect(1).toEqual(1)
  })
})

describe('compress', () => {
  let tmpdir: string

  beforeEach(async () => {
    tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'zipx-'))
  })

  afterEach(async () => {
    // best-effort cleanup
    try {
      // Node 18+ has fs.rm; in some envs it might be missing, fallback to rmdir
      if (fs.rm)
        await fs.rm(tmpdir, { recursive: true, force: true })
      else if (fsSync.existsSync(tmpdir))
        await fs.rmdir(tmpdir, { recursive: true })
    }
    catch {}
  })

  it('single target (string) works', async () => {
    const a = path.join(tmpdir, 'dist')
    await fs.mkdir(a, { recursive: true })
    await fs.writeFile(path.join(a, 'a.txt'), 'hello')
    await fs.writeFile(path.join(a, '.dot'), 'dot')

    const out = path.join(tmpdir, 'out.zip')
    await compress({ cwd: tmpdir, target: 'dist', output: out })

    const buf = await fs.readFile(out)
    const zip = await JSZip.loadAsync(buf)
    const files = Object.keys(zip.files).filter(f => !f.endsWith('/')).sort()
    expect(files).toEqual(['.dot', 'a.txt'])
  })

  it('multiple targets (array) namespaces', async () => {
    const t1 = path.join(tmpdir, 'dist')
    const t2 = path.join(tmpdir, 'public')
    await fs.mkdir(t1, { recursive: true })
    await fs.mkdir(t2, { recursive: true })
    await fs.writeFile(path.join(t1, 'a.txt'), 'a')
    await fs.writeFile(path.join(t2, 'b.txt'), 'b')

    const out = path.join(tmpdir, 'multi.zip')
    await compress({ cwd: tmpdir, target: ['dist', 'public'], output: out })

    const buf = await fs.readFile(out)
    const zip = await JSZip.loadAsync(buf)
    const files = Object.keys(zip.files).filter(f => !f.endsWith('/')).sort()
    expect(files).toEqual(['dist/a.txt', 'public/b.txt'])
  })

  it('multiple targets with namespace=false flattens', async () => {
    const t1 = path.join(tmpdir, 'dist')
    const t2 = path.join(tmpdir, 'public')
    await fs.mkdir(t1, { recursive: true })
    await fs.mkdir(t2, { recursive: true })
    await fs.writeFile(path.join(t1, 'a.txt'), 'a')
    await fs.writeFile(path.join(t2, 'b.txt'), 'b')

    const out = path.join(tmpdir, 'flat.zip')
    await compress({ cwd: tmpdir, target: ['dist', 'public'], namespace: false, output: out })

    const buf = await fs.readFile(out)
    const zip = await JSZip.loadAsync(buf)
    const files = Object.keys(zip.files).filter(f => !f.endsWith('/')).sort()
    expect(files).toEqual(['a.txt', 'b.txt'])
  })
})
