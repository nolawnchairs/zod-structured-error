
import { z, ZodError } from 'zod'
import { toStructuredError } from '../src/zod-structured-error'

describe('Options', () => {

  const schema = z.object({
    intval: z.number().int().min(10).max(100).multipleOf(2),
    nested: z.object({
      intval: z.number().int().min(10).max(100).multipleOf(2),
    }),
  })

  const run = (): ZodError => {
    try {
      schema.parse({
        intval: 1,
        nested: {
          intval: 1,
        },
      })
      return {} as unknown as ZodError // this will never be reached
    } catch (e) {
      return e as ZodError
    }
  }

  it('should use default options', () => {
    const error = run()
    const structured = toStructuredError(error)
    expect(structured['intval']).toEqual('Number must be greater than or equal to 10; Number must be a multiple of 2')
  })

  it('should use custom multiples delimiter', () => {
    const error = run()
    const structured = toStructuredError(error, { joinDelimiter: ', ' })
    expect(structured['intval']).toEqual('Number must be greater than or equal to 10, Number must be a multiple of 2')
  })

  it('should return array', () => {
    const error = run()
    const structured = toStructuredError(error, { multiplesStrategy: 'array' })
    expect(structured['intval']).toEqual(['Number must be greater than or equal to 10', 'Number must be a multiple of 2'])
  })

  it('should use a custom path delimiter', () => {
    const error = run()
    const structured = toStructuredError(error, { pathDelimiter: '/' })
    expect(Object.keys(structured)).toEqual(['intval', 'nested/intval'])
  })
})
