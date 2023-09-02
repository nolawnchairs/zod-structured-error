
# zod-structured-error

**Kneel before Zod!**

A small library that converts Zod errors into structured objects. Zero dependencies, zero fuss.

[![npm version](https://badge.fury.io/js/zod-structured-error.svg)](https://badge.fury.io/js/zod-structured-error)
[![Build Status](https://github.com/nolawnchairs/zod-structured-error/actions/workflows/publish.yml/badge.svg)](https://github.com/nolawnchairs/zod-structured-error/actions/workflows/publish.yml/badge.svg)



## Installation

```sh
npm install zod-structured-error
```

Zod is a peer dependency. Be sure it's already installed.

```sh
npm install zod
```

## Usage

### `toStructuredError`

```ts
declare function toStructuredError(
  error: ZodError<any>, 
  options?: ZodStructuredErrorOptions
): ZodStructuredError
```

 * `error` - A Zod error object
 * `options` - An optional options object

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `grouping` | union `ErrorGrouping` | `join` | How to handle multiple errors for the same path |
| `joinDelimiter` | `string` | `'; '` | The delimiter to use when joining multiple errors. Ignored when `grouping` is not `join` |
| `pathDelimiter` | `string` | `'.'` | The delimiter to use when joining error path segments |

### `ErrorGrouping`

The `grouping` option determines how multiple errors for the same path are handled. The following values are available:

| Grouping | Description |
| --- | --- |
| `join` | Join multiple errors with a delimiter (default) |
| `array` | Represent errors as arrays |
| `array-if-multiple` | Represent errors as arrays, but only if there are multiple errors for the same path |


### `ZodStructuredError`

The `ZodStructuredError` return type is an alias for `Record<string, string | string[]>` 


## Example

```ts
import { z } from 'zod'
import { toStructuredError } from 'zod-structured-error'

const schema = z.object({
  label: z.string(),
  tags: z.array(z.string().nonempty()),
  nested: z.object({
    id: z.number().positive().multipleOf(10),
    value: z.string(),
  }),
  attributes: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })),
})

const result = schema.safeParse({
  label: null,
  tags: ['foo', '', 'baz'],
  nested: {
    id: -22,
    value: 'Hello, world!',
  },
  attributes: [
    { name: 'foo', value: 'bar' },
    { name: 'baz', value: 'qux' },
  ],
})

if (!result.success) {
  const structured = toStructuredError(result.error)
  console.log(result.error)
  console.log(structured)
}
```
The Zod error for this example looks like this:

```ts
[
    {
      code: 'invalid_type',
      expected: 'string',
      received: 'null',
      path: [ 'label' ],
      message: 'Expected string, received null'
    },
    {
      code: 'too_small',
      minimum: 1,
      type: 'string',
      inclusive: true,
      exact: false,
      message: 'String must contain at least 1 character(s)',
      path: [ 'tags', 1 ]
    },
    {
      code: 'too_small',
      minimum: 0,
      type: 'number',
      inclusive: false,
      exact: false,
      message: 'Number must be greater than 0',
      path: [ 'nested', 'id' ]
    },
    {
      code: 'not_multiple_of',
      multipleOf: 10,
      message: 'Number must be a multiple of 10',
      path: [ 'nested', 'id' ]
    }
  ],
```

But the structured error looks simplifies the error and groups errors by path:

```ts
{
  'label': 'Expected string, received null',
  'tags.1': 'String must contain at least 1 character(s)',
  'nested.id': 'Number must be greater than 0; Number must be a multiple of 10'
}
```

## Customization

By default, multiple errors for the same path are joined with a semicolon. You can change the delimiter:

```ts
const structured = toStructuredError(result.error, {
  joinDelimiter: ' | ',
})

// Outputs
{
  'label': 'Expected string, received null',
  'tags.1': 'String must contain at least 1 character(s)',
  'nested.id': 'Number must be greater than 0 | Number must be a multiple of 10'
}
```

Errors can be represented arrays instead of strings:

```ts
const structured = toStructuredError(result.error, {
  grouping: 'array',
})

// Outputs
{
  'label': [ 'Expected string, received null' ],
  'tags.1': [ 'String must contain at least 1 character(s)' ],
  'nested.id': [
    'Number must be greater than 0',
    'Number must be a multiple of 10'
  ]
}

```

Errors can be represented arrays, but only if there are multiple errors for the same path:

```ts
const structured = toStructuredError(result.error, {
  grouping: 'array-if-multiple',
})

// Outputs
{
  'label': 'Expected string, received null',
  'tags.1': 'String must contain at least 1 character(s)',
  'nested.id': [
    'Number must be greater than 0',
    'Number must be a multiple of 10'
  ]
}

```

Path segments are joined with a period by default. You can change the this:

```ts
const structured = toStructuredError(result.error, {
  pathDelimiter: '/',
})

// Outputs
{
  'label': 'Expected string, received null',
  'tags/1': 'String must contain at least 1 character(s)',
  'nested/id': 'Number must be greater than 0; Number must be a multiple of 10'
}
```

## Changelog

You can find the changelog at [CHANGELOG.md](./CHANGELOG.md).
