
import { ZodIssue } from 'zod'
import { groupIssues } from '../src/zod-structured-error'

describe('Grouping', () => {
  const issues: ZodIssue[] = [
    {
      code: 'invalid_type',
      expected: 'string',
      received: 'number',
      path: ['names', 1],
      message: 'Invalid input: expected string, received number',
    },
    {
      code: 'unrecognized_keys',
      keys: ['extra'],
      path: ['address'],
      message: 'Unrecognized key(s) in object: \'extra\'',
    },
    {
      code: 'too_small',
      minimum: 10000,
      type: 'number',
      inclusive: true,
      path: ['address', 'zipCode'],
      message: 'Value should be greater than or equal to 10000',
    },
    {
      code: 'invalid_type',
      expected: 'string',
      received: 'undefined',
      path: ['attributes', 1, 'name'],
      message: 'Required',

    },
  ]

  it('should group errors based on path', () => {
    const parsed = groupIssues(issues)
    expect(parsed['address']).toEqual(['Unrecognized key(s) in object: \'extra\''])
    expect(parsed['address.zipCode']).toEqual(['Value should be greater than or equal to 10000'])
    expect(parsed['names.1']).toEqual(['Invalid input: expected string, received number'])
    expect(parsed['attributes.1.name']).toEqual(['Required'])
  })
})
