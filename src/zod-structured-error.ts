
import { ZodError, ZodIssue } from 'zod'

export type ZodStructuredErrorOptions =
  ZodStructuredErrorOptionsBase & (
    ZodStructuredErrorOptionsJoin |
    ZodStructuredErrorOptionsArray
  )

type ZodStructuredErrorOptionsBase = {
  /**
   * How to handle multiple issues for the same path.
   * - `join` (default): join error messages with a delimiter (see `joinDelimiter`)
   * - `array`: all error messages are returned as an array
   * - `array-if-multiple`: if there is only one issue, return the message as a string, otherwise return an array
   */
  multiplesStrategy?: 'join' | 'array' | 'array-if-multiple'
  /**
   * Delimiter to use when joining multiple issues for the same path
   * Default: `; ` (semicolon + space)
   */
  joinDelimiter?: string
  /**
   * Delimiter to use when joining path segments. Default: `.`
   */
  pathDelimiter?: string
}

type ZodStructuredErrorOptionsJoin = {
  multiplesStrategy?: 'join'
  delimiter?: string
}

type ZodStructuredErrorOptionsArray = {
  multiplesStrategy: 'array' | 'array-if-multiple'
  delimiter?: never
}

export type ZodStructuredError = Record<string, string | string[]>

const DEFAULT_OPTIONS: ZodStructuredErrorOptions = {
  multiplesStrategy: 'join',
  joinDelimiter: '; ',
  pathDelimiter: '.',
}

/**
 * Converts a ZodError to a structured error.
 *
 * @export
 * @param {ZodError} error The Zod error
 * @param {ZodStructuredErrorOptions} [options] options
 * @return {*}  {ZodStructuredError}
 */
export function toStructuredError(error: ZodError, options?: ZodStructuredErrorOptions): ZodStructuredError {
  const config = { ...DEFAULT_OPTIONS, ...(options ?? {}) }
  const result = groupIssues(error.issues, config.pathDelimiter)
  const output: ZodStructuredError = {}
  for (const key in result) {
    switch (config.multiplesStrategy) {
      case 'array':
        output[key] = result[key]
        break
      case 'array-if-multiple':
        output[key] = result[key].length > 1 ? result[key] : result[key][0]
        break
      case 'join':
      default:
        output[key] = result[key].join(config.joinDelimiter)
    }
  }
  return output
}

/**
 * Groups ZodIssues by path.
 *
 * @export
 * @param {ZodIssue[]} issues The Zod issues
 * @param {string} [pathDelimiter='.'] The path delimiter
 * @return {*}  {Record<string, string[]>}
 */
export function groupIssues(issues: ZodIssue[], pathDelimiter: string = '.'): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const issue of issues) {
    const path = issue.path.join(pathDelimiter)
    if (!result[path]) {
      result[path] = [issue.message]
    } else {
      result[path].push(issue.message)
    }
  }
  return result
}
