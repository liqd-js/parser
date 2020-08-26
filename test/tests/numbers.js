'use strict';

const fs = require('fs');
const assert = require('assert');
const Parser = require('../../lib/parser');

it( 'Should parse Numbers', () =>
{
    const parser = new Parser( __dirname + '/../syntax/numbers.syntax' );

    const output = parser.parse( fs.readFileSync( __dirname + '/../datasets/numbers.input.txt', 'utf8' ));

    assert.deepStrictEqual( output, require( __dirname + '/../datasets/numbers.output.json' ));
});