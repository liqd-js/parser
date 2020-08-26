'use strict';

const fs = require('fs');
const assert = require('assert');
const Parser = require('../../lib/parser');

it( 'Should parse CSV', () =>
{
    const parser = new Parser( __dirname + '/../syntax/csv.syntax' );

    const output = parser.parse( fs.readFileSync( __dirname + '/../datasets/csv.input.txt', 'utf8' ));

    assert.deepStrictEqual( output, require( __dirname + '/../datasets/csv.output.json' ));
});