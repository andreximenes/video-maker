const Algorithmia = require('algorithmia');
const {apiKey} = require('../credentials/algorithmia.json');

async function robot(content) {
    await fetchContentFromWikipedia(content);
    sanitizeContent(content);
    //breakContentIntoSentences(content);

    async function fetchContentFromWikipedia(content) {
        const response = await Algorithmia.client(apiKey)
            .algo("web/WikipediaParser/0.1.2?timeout=300")
            .pipe(content.searchTerm);
        
        const originalContent = response.get();
        content.sourceContentOriginal = originalContent.content;
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdowns = removeBlankLinesAndMarkdowns(content.sourceContentOriginal);
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdowns);
        console.log(withoutDatesInParentheses);

        function removeBlankLinesAndMarkdowns(text) {
            const allLines = text.split('\n');
            const withoutBlankLinesAndMarkdowns = allLines.filter((line) => {
                if(line.trim().length === 0 || line.trim().startsWith('=')){
                    return false;
                }
                return true;
            });
            return withoutBlankLinesAndMarkdowns.join(' ');
        }

        function removeDatesInParentheses(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

   

}
module.exports = robot;