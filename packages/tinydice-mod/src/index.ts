import type {Dice, DiceOptions} from 'tinydice'

import {d, convert} from 'tinydice'

type DiceFn = (...d: Dice) => number
export type Roll = {
  value: Dice
  evaluate: () => Array<number>
  total: () => number
  options?: DiceOptions & {
    fn: (...d: Dice) => number
  }
}
// Parameters<typeof d> won't work as TS doesn't correctly understand overloading so we'll recreate the function signature here. sigh.
export function roll(
  num: string | number,
  sides?: number | DiceOptions,
  options?: DiceOptions & {
    fn?: DiceFn
  }
): Roll {
  let value: Dice = [0, 0]
  let opts: DiceOptions = {random: Math.random}

  if (typeof num === 'string') {
    const c = convert(num)
    value = c
    if (typeof sides == 'object') {
      opts = sides
    }
  } else {
    if (sides == null) {
      throw new Error('tinydice-mod: incorrect function signature')
    }

    value[0] = num

    if (typeof sides == 'number') {
      value[1] = sides

      if (options != null) {
        opts = options
      }
    }
  }

  const [n, m] = value
  const defaultFn = (...args: Dice) => d(...args, opts)
  const fn = options?.fn ?? defaultFn

  return {
    value: value,
    options: {
      ...opts,
      fn,
    },
    evaluate: () => {
      return Array.from({length: n}).map((_) => {
        return fn(1, m)
      })
    },
    total: () => {
      return fn(n, m)
    },
  }
}

roll.from = (r: Roll, fn: DiceFn) => {
  let opts = r.options
  if (opts == null) {
    opts = {
      fn: fn,
      random: Math.random,
    }
  }

  opts.fn = fn
  return roll(r.value[0], r.value[1], opts)
}

export type Modifier = (
  ...p: Array<any>
) => (...args: Array<Roll>) => Array<Roll>
export function mod(...args: Array<Roll | ReturnType<Modifier>>): number {
  const modifiers: Array<ReturnType<Modifier>> = args.filter(
    (arg) => typeof arg === 'function'
  ) as Array<ReturnType<Modifier>>
  // const initial = args[0] as Roll
  const initial = args.filter((arg) => typeof arg === 'object') as Array<Roll>
  if (!initial.length) {
    throw new Error('tinydice: Can not find rolls to modify')
  }
  const rolls = modifiers.reduce((roll, mod) => mod(...roll), initial)
  // @TODO what to do here with multiple?
  // We _could_ assume that you use some sort of combinator to reduce multiple rolls into a single roll (such as advantage, or combine). For now lets do that and use the head of the array.
  return rolls[0].total()
}

/**
 * Modifier functions
 */
// Takes the output of each roll and applies 2 to it
export function plus(value: number) {
  return function modPlus(...args: Array<Roll>): Array<Roll> {
    return args.map((r) => {
      return roll.from(r, (...args) => {
        return r.total() + 2
      })
    })
  }
}

// Takes the output of each roll and reduces it by 2
export function minus(value: number) {
  return function modMinus(...args: Array<Roll>): Array<Roll> {
    return args.map((r) => {
      return roll.from(r, (...args) => {
        return r.total() - 2
      })
    })
  }
}

// Combines all rolls into a single one, using the input function to combine them
export function combine(
  fn: (a: number, b: number) => number = (a, b) => a + b,
  initial: number = 0
) {
  return function modCombine(...args: Array<Roll>): Array<Roll> {
    return [
      roll(0, 0, {
        random: Math.random,
        fn: () => {
          return args.reduce((total, next) => {
            return fn(total, next.total())
          }, initial)
        },
      }),
    ]
  }
}

export function advantage() {
  return combine(Math.max, -Number.MAX_SAFE_INTEGER)
}
export function disadvantage() {
  return combine(Math.min, Number.MAX_SAFE_INTEGER)
}
