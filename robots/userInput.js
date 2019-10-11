const readline = require('readline-sync');

async function robot(content){

    content.searchTerm =  askAndReturnSearchTerm();
    content.lang = askAndReturnLanguage();
    content.prefix= askAndReturnPrefix();

    function askAndReturnSearchTerm(){
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of']
        const index = readline.keyInSelect(prefixes, 'Choose the prefix: ')
        return prefixes[index];
    }
    function askAndReturnLanguage(){
        const languages = ['PT', 'EN']
        const index = readline.keyInSelect(languages, 'Choose preferred language: ')
        return languages[index];
    }

}

module.exports = robot;