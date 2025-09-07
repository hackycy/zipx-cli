import process from 'node:process'
import { NonZeroExitError } from 'tinyexec'
import { compress } from './compress'
import { parseArgs } from './parse-args'

export async function bootstrap(): Promise<void> {
  try {
    // Setup global error handlers
    process.on('uncaughtException', errorHandler)
    process.on('unhandledRejection', errorHandler)

    const args = await parseArgs()
    await compress(args)
  }
  catch (error) {
    errorHandler(error as Error)
  }
}

function errorHandler(error: Error | NonZeroExitError): void {
  let message = error.message || String(error)

  if (error instanceof NonZeroExitError)
    message += `\n\n${error.output?.stderr || ''}`

  if (process.env.DEBUG || process.env.NODE_ENV === 'development')
    message += `\n\n${error.stack || ''}`

  console.error(message)
  process.exit(1)
}
