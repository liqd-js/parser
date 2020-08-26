'use strict';

module.exports = class Token
{
    #token; #capture; #optional; #list; #delimiter;
    
    constructor( token, options )
    {
        this.#token = token;
        this.#capture = options.capture !== undefined ? options.capture || options.node || '' : false;
        this.#optional = options.optional !== undefined;
        this.#list = options.list !== undefined;
        this.#delimiter = options.delimiter;
    }

    parse( scope, source, caret, data )
    {
        let parsed = this.#token.parse( scope, source, caret, data );

        if( parsed )
        {
            if( this.#list )
            {
                let list = [ parsed.data ], next;

                do
                {
                    caret = parsed.caret;

                    if( this.#delimiter )
                    {
                        let delimiter = this.#delimiter.parse( scope, source, caret, data );

                        if( !delimiter ){ break; }

                        caret = delimiter.caret;
                    }

                    next = this.#token.parse( scope, source, caret, data );

                    if( !next ){ break; }

                    parsed = next;

                    list.push( parsed.data );
                }
                while( caret != parsed.caret )

                parsed.data = list;
            }

            if( this.#capture === false )
            {
                parsed.data = undefined;
            }
            else if( this.#capture )
            {
                if( this.#capture[0] === '.' )
                {
                    let data = parsed.data;

                    for( let key of this.#capture.split('.').filter( Boolean ))
                    {
                        data = data[key];
                    }

                    parsed.data = data;
                }
                else
                {
                    parsed.data = { [this.#capture]: parsed.data };
                }
            }
        }
        else if( !parsed && this.#optional )
        {
            parsed = { caret };

            if( this.#capture )
            {
                parsed.data = { [this.#capture]: this.#list ? [] : undefined };
            }
        }
        
        if( parsed )
        {
            scope.__max_caret = Math.max( scope.__max_caret, parsed.caret );
        }

        return parsed;
    }
}