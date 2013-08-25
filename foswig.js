/**
@license Foswig.js | (c) Glenn Conner. | https://github.com/mrsharpoblunto/foswig.js/blob/master/LICENSE
*/
(function(global){
	
global['foswig'] = {};

/** 
 * @constructor 
 * @param {number} order The order of the Markov chain. This indicates how many previous characters to take into account when picking the next. A lower number represents more random words, whereas a higher number will result in words that match the input words more closely.
 */
global['foswig']['MarkovChain'] = function(order)
{
	/** 
	 * @private
	 * @constructor 
	 * @param {string} ch The character to store in this node
	 */
	function Node(ch) {
		this.character = ch;
		this.neighbors = [];
	};
	
	/** 
	 * @private
	 * @constructor
	 */
	function TrieNode() {
		this.children = [];
	};
	
	var duplicates = new TrieNode();	
	var start = new Node('');
	var map = {};
	
	/**
	 * Adds an array or words to the Markov chain
	 * @param {Array.<string>} words The words to add to the Markov chain
	 */
	this['addWordsToChain'] = function(words) {
		for (var i=0;i<words.length;++i) {
			this['addWordToChain'](words[i]);
		}
	};


	/**
	 * @private
	 * Adds a word and all its substrings to a duplicates trie to
	 * ensure that generated words are never an exact match or substring
	 * of a word in the input dictionary. Building a trie allows us
	 * to efficiently search for these duplicates later without 
	 * having to do O(N) comparision checks over the entire dictionary
	 * @param {string} word the word to add to the duplicates trie.
	 */
	var addToDuplicatesTrie = function(word) {
		if (word.length > 1) {
			addToDuplicatesTrie(word.substr(1));
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
	};
	
	/**
	 * @private
	 * Check to see if a word is a match to any substring in the input
	 * dictionary in O(N) time, where N is the number of characters in the
	 * word rather than the number of words in the dictionary.
	 * @param {string} word The word we want to find out whether it is a 
	 * duplicate of a substring in the input dictionary.
	 */
	var isDuplicate = function(word) {
		word = word.toLowerCase();
		var currentNode = duplicates;
		for (var i=0;i<word.length;++i) {
			var childNode = currentNode.children[word[i]];
			if (!childNode) return false;
			currentNode = childNode;
		}	
		return true;
	};
	
	/**
	 * Adds a single word to the Markov chain
	 * @param {string} word The word to add to the Markov chain
	 */
	this['addWordToChain'] = function(word) {
		addToDuplicatesTrie( word.toLowerCase() );
				
		var previous = start;
		var key = "";
		for (var i=0;i<word.length; ++i) {
			var ch = word[i];
			key += ch;
			if (key.length > order) {
				key = key.substr(1);
			}
			var newNode = map[key];
			if (!newNode) {
				newNode = new Node(ch);
				map[key] = newNode;
			}
			
			previous.neighbors.push(newNode);
			previous = newNode;
		}
		//link to end node.
		previous.neighbors.push(null);
	};

	/**
	 * Generates a random word based on the Markov chain
	 * @param {number} maxLength The maximum length of the generated word
	 * @param {boolean} allowDuplicates Whether generated words are allowed to be the same as words in the input dictionary
	 */	
	this['generateWord'] = function(minLength,maxLength,allowDuplicates) {
		var word;
		var repeat;
		do 
		{
			repeat = false;
			var nextNodeIndex = Math.floor(Math.random() * start.neighbors.length);
			var currentNode = start.neighbors[nextNodeIndex];
			word = "";
			
			while (currentNode && word.length<=maxLength) {
				word+=currentNode.character;
				nextNodeIndex = Math.floor(Math.random() * currentNode.neighbors.length);
				currentNode = currentNode.neighbors[nextNodeIndex];
			}
			if ( word.length > maxLength || word.length < minLength ) {
				repeat = true;
			}
		}
		// we don't want to output any exact replicas from the input dictionary
		while (repeat || (!allowDuplicates && isDuplicate(word)));
		return word;
	};
};

if (typeof global['define'] === "function" && global['define']['amd']) {
  global['define']("foswig", [], function() {
    return global['foswig'];
  });
}

}(typeof(window)!=="undefined" ? window : this));