import type { ZipxOptions } from './types'
import process from 'node:process'
import cac from 'cac'
import { version } from '../package.json'
import { loadZipxConfig } from './config'

export async function parseArgs(): Promise<ZipxOptions> {
  const args = loadCliArgs()

  const opts = await loadZipxConfig({
    target: normalizeTarget(args.target),
    output: args.output,
    include: args.include,
    exclude: args.exclude,
    namespace: args.namespace,
  })

  return opts
}

export function loadCliArgs(argv = process.argv): Record<string, any> {
  const cli = cac('bumpp')

  cli.version(version)
    .option('-t, --target <path>', 'Target directory to compress; repeat or comma-separate for multiple (e.g., -t src -t dist or src,dist)')
    .option('-o, --output <path>', 'Output file path without extension')
    .option('-i, --include [patterns...]', 'Include only these files (glob patterns)')
    .option('-e, --exclude [patterns...]', 'Exclude these files (glob patterns)')
    .option('--no-namespace', 'Flatten when using multiple targets (default is namespaced)')
    .help()

  const result = cli.parse(argv)
  const args = result.options

  // 避免不正确覆盖
  if (!argv.includes('--no-namespace')) {
    args.namespace = undefined
  }

  return args as ZipxOptions
}

function normalizeTarget(input: unknown): string | string[] | undefined {
  if (input == null)
    return undefined

  if (Array.isArray(input)) {
    const arr = input.flatMap(s => String(s).split(',')).map(s => s.trim()).filter(Boolean)
    if (arr.length === 0)
      return undefined
    return arr.length === 1 ? arr[0] : arr
  }

  const str = String(input).trim()
  if (!str)
    return undefined
  if (str.includes(',')) {
    const arr = str.split(',').map(s => s.trim()).filter(Boolean)
    return arr.length === 1 ? arr[0] : arr
  }
  return str
}
