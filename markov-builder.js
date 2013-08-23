importScripts("foswig.min.js");

var chain = null;

self.addEventListener('message', function(e) {
	if (e.data.messageType === "load") {
		//get the list of dictionary words
		var req = new XMLHttpRequest();  
		req.open('GET', "javascript-dictionary.js", false); 
		req.send( null ); 
		var data = JSON.parse(req.responseText);
			
		chain = new foswig.MarkovChain(3);

		//load the words into the markov chain
		chain.addWordsToChain(data.words);
		postMessage({messageType:"loaded"});
	}
	else if (e.data.messageType === "generate" && chain) {
		postMessage({messageType:"generate",word:chain.generateWord(e.data.minLength,e.data.maxLength,false)});
	}
},false);
