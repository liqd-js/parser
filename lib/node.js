'use strict';

module.exports = class Node
{
    static move( src_node, dst_node )
    {
        dst_node.#branches  = src_node.#branches;
        dst_node.#transform = src_node.#transform;
    }

    #branches; #transform;

    constructor( branches = [], transform = undefined )
    {
        this.#branches = branches;
        this.#transform = transform;
    }

    parse( scope, source, caret )
    {
        for( let branch of this.#branches )
        {
            let parsed = branch.parse( scope, source, caret );

            if( parsed )
            {
                this.#transform && ( parsed.data = this.#transform( scope, parsed.data ));

                return parsed;
            }
        }
    }
}