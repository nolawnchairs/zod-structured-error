
import { z, ZodError } from 'zod'
import { toStructuredError } from '../src/zod-structured-error'

describe('Structured Error', () => {

  const schema = z.object({
    email: z.string().email(),
    address: z.object({
      city: z.string().nonempty(),
      zipCode: z.string().regex(/^[0-9]{5}$/),
    }),
    hobbies: z.array(z.string().nonempty()),
    attributes: z.array(
      z.object({
        name: z.string().nonempty(),
        value: z.number().int().max(10),
      })
    ),
  })

  const sample = {
    email: 'foo',
    address: {
      city: 'Foo',
      zipCode: 'ABC123',
    },
    hobbies: ['eating', 'sleeping', 'coding', '', 3],
    attributes: [
      { name: 'foo', value: 11 },
      { value: 1 },
    ],
  }

  const run = (): ZodError => {
    try {
      schema.parse(sample)
      return {} as unknown as ZodError // this will never be reached
    } catch (e) {
      return e as ZodError
    }
  }

  it('should structure the error', () => {
    const error = run()
    const structured = toStructuredError(error)
    expect(structured['email']).toEqual('Invalid email')
    expect(structured['address.zipCode']).toEqual('Invalid')
    expect(structured['hobbies.3']).toEqual('String must contain at least 1 character(s)')
    expect(structured['hobbies.4']).toEqual('Expected string, received number')
    expect(structured['attributes.0.value']).toEqual('Number must be less than or equal to 10')
    expect(structured['attributes.1.name']).toEqual('Required')
  })
})
