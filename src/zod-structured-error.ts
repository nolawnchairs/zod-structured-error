
import { ZodError, ZodIssue } from 'zod'

export type ZodStructuredErrorOptions =
  ZodStructuredErrorOptionsBase & (
    ZodStructuredErrorOptionsJoin |
    ZodStructuredErrorOptionsArray
  )

type ZodStructuredErrorOptionsBase = {
  /**
   * How to handle multiple issues for the same path.
   * - `join` (default): join error messages with the delimiter
   * - `array`: return an array of error messages
   */
  multiplesStrategy?: 'join' | 'array'
  /**
   * Delimiter to use when joining multiple issues for the same path. A space is added after delimiters.
   * Default: `;`
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
  multiplesStrategy: 'array'
  delimiter?: never
}

export type ZodStructuredError = Record<string, string | string[]>

const DEFAULT_OPTONS: ZodStructuredErrorOptions = {
  multiplesStrategy: 'join',
  joinDelimiter: ';',
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
  const config = { ...DEFAULT_OPTONS, ...(options ?? {}) }
  const result = groupIssues(error.issues, config.pathDelimiter)
  const output: ZodStructuredError = {}
  if (config.multiplesStrategy === 'join') {
    for (const key in result) {
      output[key] = result[key].join(`${config.joinDelimiter} `)
    }
  } else {
    for (const key in result) {
      output[key] = result[key]
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
