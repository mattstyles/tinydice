type Options = {
  random: () => number
}
const defOptions: Options = {
  random: Math.random,
}

export type Dice = [number, number]
export function dice(
  num: number,
  sides: number,
  options: Options = defOptions
): number {
  if (num <= 0) {
    throw new Error('tinydice: Number of dice must be positive')
  }
  let total = 0
  while (--num >= 0) {
    total = total + rand(1, sides, options.random)
  }
  return total
}

export function diceString(str: string, options: Options = defOptions): number {
  return dice(...convert(str), options)
}

export const reDice = /(?<n>^[0-9]+)d(?<m>[0-9]+$)/
export function convert(str: string): Dice {
  if (!reDice.test(str)) {
    throw new Error('tinydice: Can not parse dice string ' + str)
  }

  const match = str.match(reDice)
  if (match == null) {
    throw new Error('tinydice: Can not parse dice string ' + str)
  }
  try {
    const n = parseInt(match[1])
    const m = parseInt(match[2])

    if (Number.isNaN(n) || Number.isNaN(m)) {
      throw new Error('tinydice: Can not parse dice string ' + str)
    }

    return [n, m]
  } catch {
    throw new Error('tinydice: Can not parse dice string ' + str)
  }
}

export function d(n: string, options?: Options): number
export function d(n: number, m: number | Options, options?: Options): number
export function d(
  n: number | string,
  m?: number | Options,
  options: Options = defOptions
): number {
  if (typeof n === 'string') {
    return diceString(n, typeof m == 'object' ? m : defOptions)
  }

  const mm = typeof m === 'number' ? m : 6
  const o = typeof m === 'object' ? m : options
  return dice(n, mm, o)
}

export function rand(
  lower: number,
  upper: number,
  fn: () => number = Math.random
) {
  return Math.trunc(lower + (upper + 1 - lower) * fn())
}
