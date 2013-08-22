var MarkovChain = function(order)
{
	var Node = function(ch) {
		this.character = ch;
		this.neighbors = [];
	};

	var startNode = new Node('\0');
	var map = {};
	var words = {};

	this.addWordToChain = function(word) {
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
	}
	
	this.generateWord = function(maxLength) {
		var word;
		do 
		{
			var nextNodeIndex = Math.floor(Math.random() * startNode.neighbors.length);
			var currentNode = startNode.neighbors[nextNodeIndex];
			word = "";
			
			while (currentNode && word.length<maxLength) {
				word+=currentNode.character;
				nextNodeIndex = Math.floor(Math.random() * currentNode.neighbors.length);
				currentNode = currentNode.neighbors[nextNodeIndex];
			}
		}
		while (words[word]);
		return word;
	}
};

var chain = null;

self.addEventListener('message', function(e) {
	if (e.data.messageType === "load") {
		//get the list of dictionary words
		var req = new XMLHttpRequest();  
		req.open('GET', "/javascript-dictionary.js", false); 
		req.send( null ); 
		var data = JSON.parse(req.responseText);
			
		chain = new MarkovChain(3);

		//load the words into the markov chain
		var total = data.words.length;
		for (var i=0;i<data.words.length;++i) {
			chain.addWordToChain(data.words[i]);
			postMessage({messageType:"progress",progress:Math.floor((i/total)*100)});
		}
		postMessage({messageType:"progress",progress:100});
	}
	else if (e.data.messageType === "generate" && chain) {
		postMessage({messageType:"generate",word:chain.generateWord(e.data.maxLength)});
	}
},false);
