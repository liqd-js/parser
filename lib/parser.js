'use strict';

const Syntax = require('./syntax');

class ParserError extends Error
{
    constructor( err, fn )
    {
        //console.log( err );

        //super( err instanceof Error ? err : `Cannot parse ${ err.type } at line ${ err.lineNo }${ err.linePosition ? ', character ' + err.linePosition : '' } [${ err.filename }]\n\n${ err.line.replace(/\t/g,'  ') }\n${ ' '.repeat( err.linePosition - 1 + err.line.substr( 0, err.linePosition - 1 ).replace(/[^\t]/g,'').length ) + '^' }\n` );

        super( err.message );

        //Error.captureStackTrace( this, Parser );
        Error.captureStackTrace( this, fn );
    }
}

const Parser = module.exports = class Parser
{
    #syntax;

    constructor( syntax )
    {
        try
        {
            this.#syntax = Syntax.load( syntax );
        }
        catch( e ){ throw new ParserError( e )}
    }

    parse( source, scope = {})
    {
        try
        {
            return this.#syntax.parse( source, scope );
        }
        catch( e ){ throw new ParserError( e, this.parse )}
    }
}