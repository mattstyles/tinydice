import {describe, test, expect} from 'vitest'

import {roll, mod, plus, minus, combine, advantage, disadvantage} from './'

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

describe('Roll setup', () => {
  test('Roll should store a representation of the structure', () => {
    expect(roll(1, 6).value).toStrictEqual([1, 6])
    expect(roll(3, 4).value).toStrictEqual([3, 4])
    expect(roll('2d7').value).toStrictEqual([2, 7])
    expect(roll('12d20').value).toStrictEqual([12, 20])

    // Check rng options
    const rng = () => 0.9999
    expect(roll('1d6', {random: rng}).total()).toBe(6)
    const rng2 = () => 0
    expect(roll('1d6', {random: rng2}).total()).toBe(1)
  })
})

describe('Evaluation functions', () => {
  test('That evaluate returns an array of dice roll values', () => {
    const tests: Array<{
      fixture: [number, number]
      expected: Array<[number, number]> // Represents a range
    }> = [
      {fixture: [1, 6], expected: [[1, 6]]},
      {
        fixture: [2, 6],
        expected: [
          [1, 6],
          [1, 6],
        ],
      },
      {
        fixture: [3, 4],
        expected: [
          [1, 4],
          [1, 4],
          [1, 4],
        ],
      },
    ]

    // We are not testing the dice rolling distribution here, instead we want to ensure that Roll.evaluate returns something useful
    for (let t of tests) {
      const output = roll(...t.fixture).evaluate()
      expect(output.length).toBe(t.expected.length)
      output.forEach((v, idx) => {
        expect(v).toBeWithinRange(t.expected[idx])
      })
    }
  })

  // We're not testing distribution, only that this function returns something useful and isn't throwing
  test('That total returns the full value', () => {
    const tests: Array<string> = ['1d6', '2d6', '3d4', '12d3', '7d15']
    for (let t of tests) {
      expect(typeof roll(t).total()).toBe('number')
    }
  })
})

describe('mod function', () => {
  test('Test mod function signature', () => {
    const t1Mod = () => () => [roll(1, 1)]
    const t2Mod = () => () => [roll(2, 1)]

    expect(mod(roll('1d6'), t1Mod())).toBe(1)
    expect(mod(roll('1d6'), roll(2, 7), t1Mod())).toBe(1)
    expect(mod(roll('1d6'), t1Mod(), t2Mod())).toBe(2)
  })
})

describe('mod functions', () => {
  const rng = () => 0.9999
  const rng1 = () => 0

  test('[mod][plus]', () => {
    expect(mod(roll('1d6', {random: rng}), plus(2))).toBe(8)
    expect(mod(roll('2d4', {random: rng}), plus(2))).toBe(10)
  })

  test('[mod][minus]', () => {
    expect(mod(roll('1d6', {random: rng}), minus(2))).toBe(4)
    expect(mod(roll('2d4', {random: rng}), minus(2))).toBe(6)
  })

  test('[mod][combine]', () => {
    expect(
      mod(roll('1d6', {random: rng}), roll('1d6', {random: rng}), combine())
    ).toBe(12)
  })

  test('[mod][advantage]', () => {
    expect(
      mod(
        roll(1, 6, {random: rng}), // Upper bounds: 6
        roll(4, 12, {random: rng1}), // Lower bounds: 4
        advantage()
      )
    ).toBe(6)
  })

  test('[mod][disadvantage]', () => {
    expect(
      mod(
        roll(1, 6, {random: rng}), // Upper bounds: 6
        roll(4, 12, {random: rng1}), // Lower bounds: 4
        disadvantage()
      )
    ).toBe(4)
  })
})
