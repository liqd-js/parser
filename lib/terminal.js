'use strict';

module.exports = class Terminal
{
    #re;

    constructor( re )
    {
        this.#re = re;
    }

    parse( scope, source, caret ) // TODO max length a z toho substr ked budeme chciet zmensovat - pocet prvkov v poli a pod
    {
        let match; this.#re.lastIndex = caret;

        if( match = this.#re.exec( source ))
        {
            scope.__max_caret = Math.max( scope.__max_caret, caret + match[0].length );

            return { caret: caret + match[0].length, data: match.groups || match[0] }
        }
    }
}