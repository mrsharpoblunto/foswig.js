/**
 * @format
 */
import MarkovChain from '../index';
import {words} from './dictionary';
import {test, expect} from '@jest/globals';

test('should generate words of the correct length', function () {
  const markov = new MarkovChain(2, words);

  for (let i = 0; i < 100; ++i) {
    const word = markov.generate({
      minLength: 2,
      maxLength: 5,
      allowDuplicates: true,
      maxAttempts: 0,
    });
    expect(word.length).toBeGreaterThanOrEqual(2);
    expect(word.length).toBeLessThanOrEqual(5);
  }
});

test('should not generate duplicate words from the input dictionary', function () {
  const markov = new MarkovChain(2, words);

  for (let i = 0; i < 100; ++i) {
    const word = markov.generate({
      minLength: 2,
      maxLength: 5,
      allowDuplicates: false,
      maxAttempts: 0,
    });
    expect([word]).toEqual(expect.not.arrayContaining(words));
  }
});

test('should generate words of the correct length when no maxLength is specified', function () {
  const markov = new MarkovChain(2, words);

  for (let i = 0; i < 100; ++i) {
    const word = markov.generate({
      minLength: 2,
      allowDuplicates: true,
      maxAttempts: 0,
    });
    expect(word.length).toBeGreaterThanOrEqual(2);
  }
});

test('should bail out when minLength constraint cannot be satisfied', function () {
  const markov = new MarkovChain(2, words);

  for (let i = 0; i < 100; ++i) {
    expect(() =>
      markov.generate({
        minLength: 1000,
      }),
    ).toThrow();
  }
});

test('allows use of a custom random generator', function () {
  const markov = new MarkovChain(2, words);

  let called = false;
  const Random = seed => {
    let m = 0x80000000;
    let a = 1103515245;
    let c = 12345;
    let state = seed;

    return () => {
      state = (a * state + c) % m;
      called = true;
      return state;
    };
  };

  markov.generate({
    random: Random(2501),
  });
  expect(called).toBeTruthy();
});
