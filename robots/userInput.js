const readline = require('readline-sync');

async function robot(content){

    content.searchTerm =  askAndReturnSearchTerm();
    content.prefix= askAndReturnPrefix();

    function askAndReturnSearchTerm(){
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of']
        const index = readline.keyInSelect(prefixes, 'Choose the prefix: ')
        return prefixes[index];
    }
}

module.exports = robot;