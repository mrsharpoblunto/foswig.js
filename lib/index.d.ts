declare module 'foswig' {
    class Foswig {
        constructor(order: number);

        addWordsToChain(words: string[]): void;
        addWordToChain(word: string): void;
        generateWord(minLength?: number, maxLength?: number, allowDuplicates?: boolean, maxAttempts?: number): string;
    }
    
    export = Foswig;
}