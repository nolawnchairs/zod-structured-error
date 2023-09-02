import { z, ZodError } from 'zod'
import { inspect } from 'util'

const schema = z.object({
  intval: z.number().int().min(10).max(100).multipleOf(2),
})

const run = (): ZodError => {
  try {
    schema.parse({ intval: 1 })
    return {} as unknown as ZodError // this will never be reached
  } catch (e) {
    return e as ZodError
  }
}

console.log(inspect(run(), { colors: true, depth: 8 }))
