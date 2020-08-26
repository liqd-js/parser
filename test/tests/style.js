'use strict';

const fs = require('fs');
const assert = require('assert');
const Parser = require('../../lib/parser');

it( 'Should parse Style', () =>
{
    const parser = new Parser( __dirname + '/../syntax/style.syntax' );

    try
    {
        const output = parser.parse( fs.readFileSync( __dirname + '/../datasets/style.input.txt', 'utf8' ));

        //console.log( JSON.stringify( output, null, '  ' ));

        assert.deepStrictEqual( output, require( __dirname + '/../datasets/style.output.json' ));
    }
    catch(e)
    {
        console.log( "error", e, e.stack );
    }
});