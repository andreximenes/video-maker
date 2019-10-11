const Algorithmia = require('algorithmia');
const {apiKey} = require('../credentials/algorithmia.json');
const sbd = require('sbd');

async function robot(content) {
    await fetchContentFromWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentences(content);

    console.log(content);

    async function fetchContentFromWikipedia(content) {
        const response = await Algorithmia.client(apiKey)
            .algo("web/WikipediaParser/0.1.2?timeout=300")
            .pipe({
                "articleName": content.searchTerm,
                "lang": content.lang
              });
        
        const originalContent = response.get();
        content.sourceContentOriginal = originalContent.content;
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdowns = removeBlankLinesAndMarkdowns(content.sourceContentOriginal);
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdowns);
        content.sourceContentSanitized = withoutDatesInParentheses;

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

    function breakContentIntoSentences(content){
        content.sentences = [];
        const sentences = sbd.sentences(content.sourceContentSanitized);
        sentences.forEach((sentence) => {
            content.sentences.push(
                {
                    text: sentence,
                    keywords: [],
                    images: []
                }
            );
        })
    }


}
module.exports = robot;