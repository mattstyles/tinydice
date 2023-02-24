/**
 * We want to test bounds of various rolls and have some indication that the distribution is correct. We'll use statistical analysis of n number of rolls, this is not perfect but should get us close enough to assert that the functions are working as intended.
 */

import {describe, test, expect} from 'vitest'

import {d, dice, diceString, convert} from './'

expect.extend({
  toBeWithinRange(received: number, expected: [number, number]) {
    const {isNot} = this
    return {
      pass: received >= expected[0] && received <= expected[1],
      message: () =>
        `${received} is${isNot ? ' not' : ''} within range [${expected[0]}, ${
          expected[1]
        }]`,
    }
  },
})

interface CustomMatchers<R = unknown> {
  toBeWithinRange(expected: [number, number]): R
}

declare global {
  namespace Vi {
    interface Assertion extends CustomMatchers {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}

// Returns a map, where keys are the returned number, and values are percentage (0...1) occurence
function generateSample(
  fn: () => number,
  n: number = 1e4
): Map<number, number> {
  const sample = new Map<number, number>()
  let idx = n
  while (--idx >= 0) {
    let result = fn()
    sample.set(result, (sample.get(result) ?? 0) + 1)
  }
  for (let [key, value] of sample.entries()) {
    sample.set(key, value / n)
  }
  return sample
}

describe('Dice functions', () => {
  test('Dice functions should return a bound of numbers', () => {
    const tests: Array<{
      fixture: [number, number]
      range: [number, number]
    }> = [
      {fixture: [1, 6], range: [1, 6]},
      {fixture: [2, 6], range: [2, 12]},
      {fixture: [10, 2], range: [10, 20]},
      // Note 1e4 is not enough samples to reliably get the bounds for many dice
      // {fixture: [10, 6], range: [10, 60]}
    ]

    for (let t of tests) {
      let sample = generateSample(() => dice(...t.fixture))
      let [min, max] = t.range

      expect(sample.get(min)).toBeGreaterThan(0)
      expect(sample.get(max)).toBeGreaterThan(0)
      expect(sample.get(min - 1)).toBeUndefined()
      expect(sample.get(max + 1)).toBeUndefined()
    }
  })

  // Note that this is far from perfect
  test('Dice functions should have a rough distribution', () => {
    const tests: Array<{
      fixture: [number, number]
      peak: number
      compareWith: number
    }> = [
      {fixture: [2, 6], peak: 7, compareWith: 1},
      {fixture: [3, 4], peak: 7, compareWith: 1},
    ]

    for (let t of tests) {
      let sample = generateSample(() => dice(...t.fixture))
      expect(sample.get(t.peak)).toBeGreaterThan(sample.get(t.compareWith) ?? 0)
    }

    // Test single dice roll distribution
    let sample = generateSample(() => dice(1, 6))
    for (let i = 1; i <= 6; i++) {
      expect(sample.get(i)).toBeWithinRange([0.15, 0.18])
    }
  })
})

describe('dice string functions', () => {
  test('Dice strings should be valid::pass', () => {
    const fixtures = ['1d6', '1d100', '20d4']

    for (let t of fixtures) {
      expect(() => diceString(t)).not.toThrow()
    }
  })

  test('Dice strings should be valid::fail', () => {
    const fixtures = ['1d6x', 'xd6', '1dd6', '1d6+2', '7+0d', '16d', 'zalgo']

    for (let t of fixtures) {
      expect(() => diceString(t)).toThrow()
    }
  })
})

describe('Overload d function', () => {
  test('Test bounds for string and number variants', () => {
    const tests: Array<{
      fn: () => number
      range: [number, number]
    }> = [
      {fn: () => d(1, 6), range: [1, 6]},
      {fn: () => d('1d6'), range: [1, 6]},
      {fn: () => d(3, 4), range: [3, 12]},
      {fn: () => d('10d2'), range: [10, 20]},
    ]

    for (let t of tests) {
      let sample = generateSample(t.fn)
      let [min, max] = t.range

      expect(sample.get(min)).toBeGreaterThan(0)
      expect(sample.get(max)).toBeGreaterThan(0)
      expect(sample.get(min - 1)).toBeUndefined()
      expect(sample.get(max + 1)).toBeUndefined()
    }
  })
})

describe('Dice string conversion', () => {
  test('It converts a valid string to a structure representing the dice rolls', () => {
    const tests: Array<{fixture: string; expected: [number, number]}> = [
      {fixture: '1d6', expected: [1, 6]},
      {fixture: '10d6', expected: [10, 6]},
      {fixture: '4d12', expected: [4, 12]},
      {fixture: '0d1', expected: [0, 1]},
      {fixture: '7d0', expected: [7, 0]},
      {fixture: '14d0', expected: [14, 0]},
    ]

    for (let t of tests) {
      expect(convert(t.fixture)).toStrictEqual(t.expected)
    }
  })
})

describe('Custom rng', () => {
  test('Expect dice functions to use the custom rng passed to it', () => {
    const rng = () => 0.99999
    expect(d('1d6', {random: rng})).toBe(6)
    expect(d(2, 6, {random: rng})).toBe(12)
  })
})
