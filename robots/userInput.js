const readline = require('readline-sync');
const state = require('./state');

const MAX_SENTENCES = 7;

module.exports = robot;

//MAIN FUNCTIOn
function robot() {
  const content = {
    maximumSentences: MAX_SENTENCES
  }

  content.searchTerm = askAndReturnSearchTerm();
  content.lang = askAndReturnLanguage();
  content.prefix = askAndReturnPrefix();
  state.save(content);
}

function askAndReturnSearchTerm() {
  return readline.question('Type a Wikipedia search term: ')
}

function askAndReturnPrefix() {
  const prefixes = ['Who is', 'What is', 'The history of']
  const index = readline.keyInSelect(prefixes, 'Choose the prefix: ')
  return prefixes[index];
}

function askAndReturnLanguage() {
  const languages = ['PT', 'EN']
  const index = readline.keyInSelect(languages, 'Choose preferred language: ')
  return languages[index];
}
