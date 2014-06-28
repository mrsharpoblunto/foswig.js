var expect = require('chai').expect;
var Foswig = require('./foswig');
var dictionary = require('./dictionary');

describe('Foswig',function() {
	describe('generateWord',function() {
		it('should generate words of the correct length',function() {
			var markov = new Foswig(2);
			markov.addWordsToChain(dictionary);

			for (var i = 0;i < 100; ++i) {
				var word = markov.generateWord(2,5,true);
				expect(word.length).to.be.at.least(2);
				expect(word.length).to.be.at.most(5);
				//console.log(word);
			}
		});

		it('should not generate duplicate words from the input dictionary',function() {
			var markov = new Foswig(2);
			markov.addWordsToChain(dictionary);

			for (var i = 0;i < 100; ++i) {
				var word = markov.generateWord(2,5,false);
				expect([word]).to.not.have.members(dictionary);
				//console.log(word);
			}
		});
	});
});

