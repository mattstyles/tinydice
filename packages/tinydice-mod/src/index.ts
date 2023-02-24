import type {Dice} from 'tinydice'

import {d, convert} from 'tinydice'

type DiceFn = typeof d

type Roll = {
  value: Dice
  evaluate: () => Array<number>
  total: () => number
}
// Parameters<typeof d> won't work as TS doesn't correctly understand overloading so we'll recreate the function signature here. sigh.
export function roll(num: string | number, sides?: number): Roll {
  let value: Dice = [0, 0]

  if (typeof num === 'string') {
    const c = convert(num)
    value = c
  } else {
    if (sides == null) {
      throw new Error('tinydice-mod: incorrect function signature')
    }

    value[0] = num
    value[1] = sides
  }

  const [n, m] = value

  // @TODO add additional functions for roll (total, evaluate, etc, anything needed for the mod function)
  return {
    value: value,
    evaluate: () => {
      return Array.from({length: n}).map((_) => {
        return d(1, m)
      })
    },
    total: () => {
      return d(n, m)
    },
  }
}
