import { ZodError } from 'zod'

/**
 * Converts a ZodError to a structured error.
 *
 * @export
 * @param {ZodError} error The Zod error
 * @param {ZodStructuredErrorOptions} [options] options
 * @return {*}  {ZodStructuredError}
 */
export declare function toStructuredError(error: ZodError, options?: ZodStructuredErrorOptions): ZodStructuredError
export type ZodStructuredError = Record<string, string | string[]>
export type ZodStructuredErrorOptions = ZodStructuredErrorOptionsBase & (ZodStructuredErrorOptionsJoin | ZodStructuredErrorOptionsArray)
export type ZodStructuredErrorOptionsArray = {
	multiplesStrategy: 'array'
	delimiter?: never
}
export type ZodStructuredErrorOptionsBase = {
	/**
	 * How to handle multiple issues for the same path.
	 * - `join` (default): join error messages with a delimiter (see `joinDelimiter`)
	 * - `array`: return an array of error messages
	 */
	multiplesStrategy?: 'join' | 'array'
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
export type ZodStructuredErrorOptionsJoin = {
	multiplesStrategy?: 'join'
	delimiter?: string
}

export {}
