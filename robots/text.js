const Algorithmia = require('algorithmia');
const AlgorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetection = require('sbd');

const watsonApiKey = require('../credentials/ibm-watson-nlu.json').apikey;
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

async function robot(content) {
  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);
  limitMaximiumSentences(content);
  await fetchKeywordsofAllSentences(content);

  async function fetchContentFromWikipedia(content) {
    const response = await Algorithmia.client(AlgorithmiaApiKey)
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
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false;
        }
        return true;
      });
      return withoutBlankLinesAndMarkdowns.join(' ');
    }

    function removeDatesInParentheses(text) {
      return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
    }
  }

  function breakContentIntoSentences(content) {
    content.sentences = [];
    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      });
    })
  }

  function limitMaximiumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSentences);
  }

  async function fetchKeywordsofAllSentences(content) {
    for (const sentence of content.sentences) {
      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
    }
  }

  async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      nlu.analyze({
        text: sentence,
        features: {
          keywords: {}
        }
      }, (error, response) => {
        if (error) {
          reject(error)
          return
        }

        const keywords = response.keywords.map((keyword) => {
          return keyword.text
        })

        resolve(keywords)
      })
    })
  }
}




module.exports = robot;
