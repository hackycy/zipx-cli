export interface ZipxOptions {
  /**
   * Current working directory for relative paths. Default is process.cwd().
   * @default process.cwd()
   */
  cwd?: string

  /**
   * Target directory to compress. Relative to cwd unless absolute. Default is 'dist'.
   * @default 'dist'
   */
  target?: string

  /**
   * Output file path without extension. If it already ends with .zip, that is used as-is.
   */
  output?: string

  /**
   * Glob patterns to include files in the archive. If not provided, all files are included.
   */
  include?: string[]

  /**
   * Glob patterns to exclude files from the archive.
   */
  exclude?: string[]

  /**
   * Compression level from 0 (no compression) to 9 (maximum compression). Default is 9.
   * @default 9
   */
  compressionLevel?: number
}
