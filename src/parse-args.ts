import type { ZipxOptions } from './types'
import process from 'node:process'
import cac from 'cac'
import { version } from '../package.json'
import { loadZipxConfig } from './config'

export async function parseArgs(): Promise<ZipxOptions> {
  const args = loadCliArgs()

  const opts = await loadZipxConfig({
    target: args.target,
    output: args.output,
    include: args.include,
    exclude: args.exclude,
  })

  return opts
}

export function loadCliArgs(argv = process.argv): Record<string, any> {
  const cli = cac('bumpp')

  cli.version(version)
    .option('-t, --target <path>', 'Target directory to compress')
    .option('-o, --output <path>', 'Output file path without extension')
    .option('-i, --include [patterns...]', 'Include only these files (glob patterns)')
    .option('-e, --exclude [patterns...]', 'Exclude these files (glob patterns)')
    .help()

  const result = cli.parse(argv)
  const args = result.options

  return args as ZipxOptions
}
