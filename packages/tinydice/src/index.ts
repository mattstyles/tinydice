import random from 'just-random-integer'

export function d(num: number, sides: number): number {
  let total = 0
  while (--num >= 0) {
    total = total + random(1, sides)
  }
  return total
}