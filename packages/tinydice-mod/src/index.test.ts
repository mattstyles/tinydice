import {describe, test, expect} from 'vitest'

import {roll} from './'

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
    const tests: Array<{
      fixture: string | [number, number]
      expected: [number, number]
    }> = [
      {fixture: '1d6', expected: [1, 6]},
      {fixture: '2d7', expected: [2, 7]},
      {fixture: [3, 4], expected: [3, 4]},
      {fixture: [30, 2], expected: [30, 2]},
    ]

    console.log('running')

    expect(1).toBe(1)

    for (let t of tests) {
      if (typeof t.fixture === 'string') {
        expect(roll(t.fixture).value).toStrictEqual(t.expected)
        return
      } else {
        expect(roll(...t.fixture).value).toStrictEqual(t.expected)
      }
    }
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
