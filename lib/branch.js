'use strict';

module.exports = class Branch
{
    #tokens;

    constructor( tokens )
    {
        this.#tokens = tokens;
    }

    parse( scope, source, caret )
    {
        let data = {};

        for( let token of this.#tokens )
        {
            let parsed = token.parse( scope, source, caret, data );

            if( parsed )
            {
                caret = parsed.caret;

                if( parsed.data !== undefined )
                {
                    if( typeof parsed.data === 'object' )
                    {
                        data = { ...data, ...parsed.data };
                    }
                    else
                    {
                        data = parsed.data;
                    }
                }

                scope.__max_caret = Math.max( scope.__max_caret, caret );
            }
            else{ return undefined }
        }

        return { caret, data };
    }
}