const fs = require('fs');

let data = fs.readFileSync( __dirname + '/source.txt', 'utf8' );
let word = /(?<test>[a-zA-Z]+)/y, space = /(?<space>[,.;\s]+)/y;
let index = 0, match;

let start = process.hrtime();

let parsed = [];

while( index < data.length )
{
    word.lastIndex =  space.lastIndex = index;

    match = data.match( word ) ||  data.match( space );

    if( !match )
    {
        console.log( data.substr( index, 10 ));
    }
    
    parsed.push( match.groups );

    index += match[0].length;
}

let end = process.hrtime( start );

console.log( 'finito', (( end[0] * 1e9 + end[1] ) / 1e6 ).toFixed( 3 ) + ' ms');

