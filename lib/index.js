/**
@license Foswig.js | (c) Glenn Conner. | https://github.com/mrsharpoblunto/foswig.js/blob/master/LICENSE
*/

/**
 * @private
 * @constructor
 * @param {string} ch The character to store in this node
 */
function Node(ch) {
	this.character = ch;
	this.neighbors = [];
}

/**
 * @private
 * @constructor
 */
function TrieNode() {
	this.children = [];
}

/**
 * @private
 * Adds a word and all its substrings to a duplicates trie to
 * ensure that generated words are never an exact match or substring
 * of a word in the input dictionary. Building a trie allows us
 * to efficiently search for these duplicates later without
 * having to do O(N) comparision checks over the entire dictionary
 * @param {string} word the word to add to the duplicates trie.
 */
function addToDuplicatesTrie(word,duplicates) {
	if (word.length > 1) {
		addToDuplicatesTrie(word.substr(1),duplicates);
	}

	var currentNode = duplicates;
	for (var i=0;i<word.length;++i) {
		var childNode = currentNode.children[word[i]];
		if (!childNode) {
			childNode = new TrieNode();
			currentNode.children[word[i]] = childNode;
		}
		currentNode = childNode;
	}
}

/**
 * @private
 * Check to see if a word is a match to any substring in the input
 * dictionary in O(N) time, where N is the number of characters in the
 * word rather than the number of words in the dictionary.
 * @param {string} word The word we want to find out whether it is a
 * duplicate of a substring in the input dictionary.
 */
function isDuplicate(word,duplicates) {
	word = word.toLowerCase();
	var currentNode = duplicates;
	for (var i=0;i<word.length;++i) {
		var childNode = currentNode.children[word[i]];
		if (!childNode) return false;
		currentNode = childNode;
	}
	return true;
}

/**
 * @constructor
 * @param {number} order The order of the Markov chain. This indicates how many previous characters to take into account when picking the next. A lower number represents more random words, whereas a higher number will result in words that match the input words more closely.
 */
module.exports = function(order)
{
	this.order = order;
	this.duplicates = new TrieNode();
	this.start = new Node('');
	this.map = {};
};

/**
 * Adds an array or words to the Markov chain
 * @param {Array.<string>} words The words to add to the Markov chain
 */
module.exports.prototype.addWordsToChain = function(words) {
	for (var i=0;i<words.length;++i) {
		this.addWordToChain(words[i]);
	}
};

/**
 * Adds a single word to the Markov chain
 * @param {string} word The word to add to the Markov chain
 */
module.exports.prototype.addWordToChain = function(word) {
	addToDuplicatesTrie( word.toLowerCase(), this.duplicates );

	var previous = this.start;
	var key = "";
	for (var i=0;i<word.length; ++i) {
		var ch = word[i];
		key += ch;
		if (key.length > this.order) {
			key = key.substr(1);
		}
		var newNode = this.map[key];
		if (!newNode) {
			newNode = new Node(ch);
			this.map[key] = newNode;
		}

		previous.neighbors.push(newNode);
		previous = newNode;
	}
	//link to end node.
	previous.neighbors.push(null);
};

/**
 * Generates a random word based on the Markov chain
 * @param {number} minLength The minimum length of the generated word
 * @param {number} maxLength The maximum length of the generated word
 * @param {boolean} allowDuplicates Whether generated words are allowed to be the same as words in the input dictionary
 * @param {number} maxAttempts The maximum number of attempts to generate a word before failing and throwing an error
 */
module.exports.prototype.generateWord = function(minLength,maxLength,allowDuplicates,maxAttempts) {
	if (typeof(minLength)==='undefined') minLength = 0;
	if (typeof(allowDuplicates)==='undefined') allowDuplicates = true;
	if (typeof(maxLength)==='undefined') maxLength = -1;
	if (typeof(maxAttempts)==='undefined') maxAttempts = 25;

	var word;
	var repeat;
	var attempts = 0;
	do
	{
		repeat = false;
		var nextNodeIndex = Math.floor(Math.random() * this.start.neighbors.length);
		var currentNode = this.start.neighbors[nextNodeIndex];
		word = "";

		while (currentNode && (maxLength < 0 || word.length<=maxLength)) {
			word+=currentNode.character;
			nextNodeIndex = Math.floor(Math.random() * currentNode.neighbors.length);
			currentNode = currentNode.neighbors[nextNodeIndex];
		}
		if ( (maxLength >= 0 && word.length > maxLength) || word.length < minLength ) {
			repeat = true;
		}
	}
	// we don't want to output any exact replicas from the input dictionary
	while (repeat || (!allowDuplicates && ++attempts < maxAttempts && isDuplicate(word,this.duplicates)));
	if (attempts >= maxAttempts) {
		throw new Error('Unable to generate a word with the given parameters after '+attempts+' attempts');
	}
	return word;
};
