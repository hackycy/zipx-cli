export interface ZipxOptions {
  /**
   * Current working directory for relative paths. Default is process.cwd().
   * @default process.cwd()
   */
  cwd?: string

  /**
   * Target directory or directories to compress.
   * - If a string, compresses the contents of that directory.
   * - If an array, compresses the contents of all specified directories into a single archive.
   *   When multiple targets are provided, each directory's contents will be namespaced under
   *   its relative path from cwd (or its basename if outside cwd) to avoid collisions.
   * Relative to cwd unless absolute. Default is 'dist'.
   * @default 'dist'
   */
  target?: string | string[]

  /**
   * Output file path without extension. If it already ends with .zip, that is used as-is.
   */
  output?: string

  /**
   * Whether to prefix files with their target directory when compressing multiple targets.
   * - true (default): Keep namespace (e.g., dist/a.txt, public/b.txt)
   * - false: Flatten and merge into archive root (e.g., a.txt, b.txt). May overwrite on conflicts.
   * @default true
   */
  namespace?: boolean

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
