/**
 * @format
 */
import MarkovChain from '../index';
import {words} from './dictionary';
import {test, expect} from '@jest/globals';

test('should generate words of the correct length', function () {
  const markov = new MarkovChain(2);
  markov.addWordsToChain(words);

  for (let i = 0; i < 100; ++i) {
    const word = markov.generateWord({
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
  const markov = new MarkovChain(2);
  markov.addWordsToChain(words);

  for (var i = 0; i < 100; ++i) {
    const word = markov.generateWord({
      minLength: 2,
      maxLength: 5,
      allowDuplicates: false,
      maxAttempts: 0,
    });
    expect([word]).toEqual(expect.not.arrayContaining(words));
  }
});

test('should generate words of the correct length when no maxLength is specified', function () {
  var markov = new MarkovChain(2);
  markov.addWordsToChain(words);

  for (var i = 0; i < 100; ++i) {
    const word = markov.generateWord({
      minLength: 2,
      allowDuplicates: true,
      maxAttempts: 0,
    });
    expect(word.length).toBeGreaterThanOrEqual(2);
  }
});
