importScripts("foswig.js");

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
