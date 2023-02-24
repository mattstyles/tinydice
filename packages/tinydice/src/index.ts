import random from 'just-random-integer'

export type Dice = [number, number]
export function dice(num: number, sides: number): number {
  if (num <= 0) {
    throw new Error('tinydice: Number of dice must be positive')
  }
  let total = 0
  while (--num >= 0) {
    total = total + random(1, sides)
  }
  return total
}

export function diceString(str: string): number {
  return dice(...convert(str))
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

export function d(n: string): number
export function d(n: number, m?: number): number
export function d(n: number | string, m?: number): number {
  if (typeof n === 'string') {
    return diceString(n)
  }

  return dice(n, m ?? 6)
}
