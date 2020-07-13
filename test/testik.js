const fs = require('fs');
const Terminal = require('../lib/terminal');
const Syntax = require('../lib/syntax');
const Parser = require('../lib/parser');

/** /
Syntax.load( __dirname + '/xml.syntax' );
/**/

/** /
let tests = 
{
    '"foo?b(.ar"'           : 'foo?b(.ar',
    '/foo?b.ar/'            : 'fobkar',
    '/foo?(?<bar>b.ar)/'    : 'fobkar'
}

for( let test in tests )
{
    let terminal = new Terminal( test );

    console.log( terminal.parse( tests[test], 0 ));
}
/**/


/** /
 
    $ => parser.unescape( $.string )

//Token.create( '?...[/\\s+,\\s+/]' );

console.log( TOKEN_RE.exec('$janko?...[foo]"ja\\"nko"') );
console.log( TOKEN_RE.exec('$janko?...[foo]/ja\/nko/') );
console.log( TOKEN_RE.exec('$janko?...[foo]:node') );

$foo:/[a-z]/ $dasda:','

/**/

/** /const parser = new Parser( __dirname + '/xml.syntax' );

console.log( JSON.stringify( parser.parse( fs.readFileSync( __dirname + '/test.xml', 'utf8' )), null, '  '));
/**/

/**/const parser = new Parser( __dirname + '/test.syntax' );

console.log( JSON.stringify( parser.parse( fs.readFileSync( __dirname + '/text.txt', 'utf8' )), null, '  '));
/**/

/** /const parser = new Parser( __dirname + '/test2.syntax' );

console.log( JSON.stringify( parser.parse( fs.readFileSync( __dirname + '/text2.txt', 'utf8' )), null, '  '));
/**/

/** /const parser = new Parser( __dirname + '/recursive.syntax' );

console.log( JSON.stringify( parser.parse( fs.readFileSync( __dirname + '/recursive.js', 'utf8' )), null, '  '));
/**/

/** /const parser = new Parser( __dirname + '/template.syntax' );

console.log( JSON.stringify( parser.parse( fs.readFileSync( __dirname + '/template.html', 'utf8' )), null, '  '));
/**/

/** /const parser = new Parser( __dirname + '/test3.syntax' );

console.log( JSON.stringify( parser.parse( fs.readFileSync( __dirname + '/text3.txt', 'utf8' )), null, '  '));
/**/