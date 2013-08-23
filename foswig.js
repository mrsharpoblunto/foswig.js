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

	var startNode = new Node('');
	var map = {};
	var words = {};
	
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
	 * Adds a single word to the Markov chain
	 * @param {string} word The word to add to the Markov chain
	 */
	this['addWordToChain'] = function(word) {
		if (words[word]) return;
		words[word] = true;
		
		var previousNode = startNode;
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
			
			previousNode.neighbors.push(newNode);
			previousNode = newNode;
		}
		//link to end node.
		previousNode.neighbors.push(null);
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
			var nextNodeIndex = Math.floor(Math.random() * startNode.neighbors.length);
			var currentNode = startNode.neighbors[nextNodeIndex];
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
		while (repeat || (!allowDuplicates && words[word]));
		return word;
	};
};

if (typeof global['define'] === "function" && global['define']['amd']) {
  global['define']("foswig", [], function() {
    return global['foswig'];
  });
}

}(typeof(window)!=="undefined" ? window : this));