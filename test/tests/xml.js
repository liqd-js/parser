'use strict';

const fs = require('fs');
const assert = require('assert');
const Parser = require('../../lib/parser');

it( 'Should parse XML', () =>
{
    const parser = new Parser( __dirname + '/../syntax/xml.syntax' );

    const output = parser.parse( fs.readFileSync( __dirname + '/../datasets/xml.input.txt', 'utf8' ));

    assert.deepStrictEqual( output, require( __dirname + '/../datasets/xml.output.json' ));
});