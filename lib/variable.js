'use strict';

module.exports = class Variable
{
    #var;

    constructor( variable )
    {
        this.#var = variable;
    }

    parse( scope, source, caret, data )
    {
        if( data && typeof data === 'object' && data.hasOwnProperty( this.#var ))
        {
            let value = data[ this.#var ].toString();

            if( source.substr( caret, value.length ) === value )
            {
                return { caret: caret + value.length };
            }
        }
    }
}