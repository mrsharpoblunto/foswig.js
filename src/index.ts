/**
@license Foswig.js | (c) Glenn Conner. | https://github.com/mrsharpoblunto/foswig.js/blob/master/LICENSE
@format
*/

interface MarkovNode {
  character: string;
  neighbors: Array<MarkovNode | null>;
}

interface TrieNode {
  children: {[key: string]: TrieNode};
}

/**
 * Adds a word and all its substrings to a duplicates trie to
 * ensure that generated words are never an exact match or substring
 * of a word in the input dictionary. Building a trie allows us
 * to efficiently search for these duplicates later without
 * having to do O(N) comparision checks over the entire dictionary
 */
function addToDuplicatesTrie(word: string, duplicates: TrieNode) {
  if (word.length > 1) {
    addToDuplicatesTrie(word.substr(1), duplicates);
  }

  var currentNode = duplicates;
  for (var i = 0; i < word.length; ++i) {
    var childNode = currentNode.children[word[i]];
    if (!childNode) {
      childNode = {children: {}};
      currentNode.children[word[i]] = childNode;
    }
    currentNode = childNode;
  }
}

/**
 * Check to see if a word is a match to any substring in the input
 * dictionary in O(N) time, where N is the number of characters in the
 * word rather than the number of words in the dictionary.
 * @param {string} word The word we want to find out whether it is a
 * duplicate of a substring in the input dictionary.
 */
function isDuplicate(word: string, duplicates: TrieNode): boolean {
  word = word.toLowerCase();
  var currentNode = duplicates;
  for (var i = 0; i < word.length; ++i) {
    var childNode = currentNode.children[word[i]];
    if (!childNode) return false;
    currentNode = childNode;
  }
  return true;
}

export default class MarkovChain {
  private order: number;
  private duplicates: TrieNode;
  private start: MarkovNode;
  private map: {[key: string]: MarkovNode};

  /**
   * order indicates how many previous characters to take into account when picking the next. A lower number represents more random words, whereas a higher number will result in words that match the input words more closely.
   */
  constructor(order: number) {
    this.order = order;
    this.duplicates = {children: {}};
    this.start = {character: '', neighbors: []};
    this.map = {};
  }

  /**
   * Adds an array or words to the Markov chain
   */
  addWordsToChain(words: Array<string>) {
    for (let i = 0; i < words.length; ++i) {
      this.addWordToChain(words[i]);
    }
  }

  /**
   * Adds a single word to the Markov chain
   */
  addWordToChain(word: string) {
    addToDuplicatesTrie(word.toLowerCase(), this.duplicates);

    let previous = this.start;
    let key = '';
    for (var i = 0; i < word.length; ++i) {
      const ch = word[i];
      key += ch;
      if (key.length > this.order) {
        key = key.substr(1);
      }
      let newNode = this.map[key];
      if (!newNode) {
        newNode = {character: ch, neighbors: []};
        this.map[key] = newNode;
      }

      previous.neighbors.push(newNode);
      previous = newNode;
    }
    //link to end node.
    previous.neighbors.push(null);
  }

  generateWord({
    minLength = 0,
    maxLength = 0,
    allowDuplicates = true,
    maxAttempts = 25,
  }: {
    minLength?: number;
    maxLength?: number;
    allowDuplicates?: boolean;
    maxAttempts?: number;
  }): string {
    let word;
    let repeat;
    let attempts = 0;
    do {
      repeat = false;
      let nextNodeIndex = Math.floor(
        Math.random() * this.start.neighbors.length,
      );
      let currentNode = this.start.neighbors[nextNodeIndex];
      word = '';

      while (currentNode && (maxLength <= 0 || word.length <= maxLength)) {
        word += currentNode.character;
        nextNodeIndex = Math.floor(
          Math.random() * currentNode.neighbors.length,
        );
        currentNode = currentNode.neighbors[nextNodeIndex];
      }
      if (
        (maxLength > 0 && word.length > maxLength) ||
        word.length < minLength
      ) {
        repeat = true;
      }
    } while (
      // we don't want to output any exact replicas from the input dictionary
      repeat ||
      (!allowDuplicates && isDuplicate(word, this.duplicates)) ||
      (maxAttempts > 0 && ++attempts < maxAttempts)
    );
    if (maxAttempts > 0 && attempts >= maxAttempts) {
      throw new Error(
        'Unable to generate a word with the given parameters after ' +
          attempts +
          ' attempts',
      );
    }
    return word;
  }
}
