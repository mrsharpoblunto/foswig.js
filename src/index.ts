/**
@license Foswig.js | (c) Glenn Conner. | https://github.com/mrsharpoblunto/foswig.js/blob/master/LICENSE
@format
*/

interface MarkovNode {
  character: string;
  neighbors: Array<MarkovNode | null>;
}

interface TrieNode {
  children: { [key: string]: TrieNode };
}

type RandomGenerator = () => number;

export default class MarkovChain {
  private order: number;
  private duplicates: TrieNode;
  private start: MarkovNode;

  /**
   * order indicates how many previous characters to take into account when picking the next. A lower number represents more random words, whereas a higher number will result in words that match the input words more closely.
   */
  constructor(order: number, words: Array<string>) {
    this.order = order;
    this.duplicates = { children: {} };
    this.start = { character: '', neighbors: [] };
    this.init(words);
  }

  private init(words: Array<string>) {
    const map: { [key: string]: MarkovNode } = {};
    for (const word of words) {
      this.addToDuplicatesTrie(word.toLowerCase());

      let previous = this.start;
      let key = '';
      for (var i = 0; i < word.length; ++i) {
        const ch = word[i];
        key += ch;
        if (key.length > this.order) {
          key = key.substr(1);
        }
        let newNode = map[key];
        if (!newNode) {
          newNode = { character: ch, neighbors: [] };
          map[key] = newNode;
        }

        previous.neighbors.push(newNode);
        previous = newNode;
      }
      //link to end node.
      previous.neighbors.push(null);
    }
  }

  /**
   * Adds a word and all its substrings to a duplicates trie to
   * ensure that generated words are never an exact match or substring
   * of a word in the input dictionary. Building a trie allows us
   * to efficiently search for these duplicates later without
   * having to do O(N) comparision checks over the entire dictionary
   */
  private addToDuplicatesTrie(word: string) {
    if (word.length > 1) {
      this.addToDuplicatesTrie(word.substr(1));
    }

    var currentNode = this.duplicates;
    for (var i = 0; i < word.length; ++i) {
      var childNode = currentNode.children[word[i]];
      if (!childNode) {
        childNode = { children: {} };
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
  private isDuplicate(word: string): boolean {
    word = word.toLowerCase();
    var currentNode = this.duplicates;
    for (var i = 0; i < word.length; ++i) {
      var childNode = currentNode.children[word[i]];
      if (!childNode) return false;
      currentNode = childNode;
    }
    return true;
  }

  generate({
    minLength = 0,
    maxLength = 0,
    allowDuplicates = true,
    maxAttempts = 25,
    random = Math.random,
  }: {
    minLength?: number;
    maxLength?: number;
    allowDuplicates?: boolean;
    maxAttempts?: number;
    random?: RandomGenerator;
  }): string {
    let word;
    let repeat;
    let attempts = 0;
    do {
      repeat = false;
      let nextNodeIndex = Math.floor(random() * this.start.neighbors.length);
      let currentNode = this.start.neighbors[nextNodeIndex];
      word = '';

      while (currentNode && (maxLength <= 0 || word.length <= maxLength)) {
        word += currentNode.character;
        nextNodeIndex = Math.floor(random() * currentNode.neighbors.length);
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
      (repeat || (!allowDuplicates && this.isDuplicate(word))) &&
      (maxAttempts <= 0 || ++attempts < maxAttempts)
    );
    if (maxAttempts > 0 && attempts >= maxAttempts) {
      throw new Error(
        'Unable to generate a word with the given parameters after ' +
          attempts +
          ' attempts'
      );
    }
    return word;
  }
}
