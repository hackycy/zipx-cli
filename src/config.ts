import type { ZipxOptions } from './types'
import process from 'node:process'
import { loadConfig } from 'c12'

export const defaulZipxOptions: ZipxOptions = {
  target: 'dist',
  output: 'archive',
}

export async function loadZipxConfig(overrides?: Partial<ZipxOptions>, cwd = process.cwd()): Promise<ZipxOptions> {
  const name = 'zipx'
  const { config } = await loadConfig<ZipxOptions>({
    name,
    defaults: defaulZipxOptions,
    overrides: {
      ...(overrides as ZipxOptions),
    },
    cwd,
  })
  return config!
}

export function defineConfig(config: Partial<ZipxOptions>): Partial<ZipxOptions> {
  return config
}
