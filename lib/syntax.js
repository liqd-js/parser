'use strict';

const fs = require('fs');
const path = require('path');

const Node = require('./node');
const Branch = require('./branch');
const Token = require('./token');
const Terminal = require('./terminal');
const Variable = require('./variable');
const Util = require('./util');

const NODE_RE = /^\s*:(?<node>[a-zA-Z0-9_$]*)\s*$/;
const REGEXP_RE = /\/((?![*+?])(?:[^\r\n\[\/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/((?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/;
const TOKEN_RE = /\s*(\$(?<variable>[a-zA-Z0-9_$]+)|((?<capture>([.a-zA-Z0-9_$]*|\{[^{}]+\}))=)?(?<optional>\?)?(?<list>[.]{3}(\[(?<delimiter>(:[a-zA-Z0-9_$]+|"([^\\"]|\\.)*"|'([^\\']|\\.)*'|\/(?![*+?])(?:[^\r\n\[\/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+\/[gmi]*|))\])?)?(:(?<node>[a-zA-Z0-9_$]+)|:?(?<string>("([^\\"]|\\.)*"|'([^\\']|\\.)*'))|:?(?<regexp>\/(?![*+?])(?:[^\r\n\[\/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+\/[gmi]*)))(?=(\s|$))\s*/y;
const TRANSFORM_RE = /^\s*(?<variable>[a-zA-Z0-9_$]+)\s*=>\s*/;
const JS_SCOPE_RE = /(\{|\}|"(?:[^\\"\r\n]|\\[^\r\n])*?"|'(?:[^\\'\r\n]|\\[^\r\n])*?'|\/(?:(?![*+?])(?:[^\r\n\[\/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/[gmi]*|[^{}"']+)/;


class GetterMap extends Map
{
    get( key, getter )
    {
        return ( getter && !super.has( key ) && super.set( key, getter() ), super.get( key ));
    }
}

const Syntaxes = new Map();

const Syntax = module.exports = class Syntax
{
    static load( filename )
    {
        let syntax = Syntaxes.get( filename = path.normalize( filename ));

        if( !syntax )
        {
            Syntaxes.set( filename, syntax = new Syntax( filename ));
        }

        return syntax;
    }

    #filename; #root; #cache;

    constructor( filename )
    {
        this.#filename = filename;

        this._parse();
    }

    _parse()
    {
        this.#cache = 
        {
            nodes       : new GetterMap(),
            branches    : new GetterMap(),
            tokens      : new GetterMap(), 
            terminals   : new GetterMap(),
            variables   : new GetterMap()
        };

        let syntax = { lines: fs.readFileSync( this.#filename, 'utf8' ).split(/\n/), line: 0, position: 0 };

        while( syntax.line < syntax.lines.length )
        {
            this._parseNode( syntax );
        }

        this.#root = this.#cache.nodes.get( 'main' ); 
        this.#cache = null;
    }

    _parseNode( syntax )
    {
        while( syntax.line < syntax.lines.length && !syntax.lines[syntax.line].trim() ){ ++syntax.line }

        if( syntax.line < syntax.lines.length )
        {
            let node_match = NODE_RE.exec( syntax.lines[syntax.line] );

            if( !node_match ){ throw { type: 'Node', filename: this.#filename, line: syntax.lines[syntax.line], lineNo: syntax.line + 1, linePosition: syntax.position + 1 }}

            ++syntax.line;

            let node = new Node( this._parseBranches( syntax ), this._parseTransform( syntax ));

            this.#cache.nodes.has( node_match.groups.node )
                ? Node.move( node, this.#cache.nodes.get( node_match.groups.node ))
                : this.#cache.nodes.set( node_match.groups.node, node );
        }
    }

    _parseBranches( syntax )
    {
        let branches = [];

        while( syntax.line < syntax.lines.length && !syntax.lines[syntax.line].trim() ){ ++syntax.line }

        do
        {
            branches.push( this.#cache.branches.get( syntax.lines[syntax.line].trim(), () => new Branch( this._parseTokens( syntax ))));
        }
        while( ++syntax.line < syntax.lines.length && syntax.lines[syntax.line].trim() )

        return branches;
    }

    _parseTransform( syntax )
    {
        let transform;
            
        while( syntax.line < syntax.lines.length && !syntax.lines[syntax.line].trim() ){ ++syntax.line }

        if( syntax.line < syntax.lines.length )
        {
            let transform_match = TRANSFORM_RE.exec( syntax.lines[syntax.line] );

            if( transform_match )
            {
                let line = syntax.lines[syntax.line].substr( transform_match[0].length ).trim();

                if( line && line[0] !== '{' )
                {
                    transform = new Function( 'scope', transform_match.groups.variable, 'with( scope ){ return ' + syntax.lines[syntax.line].substr( transform_match[0].length ) + ' }' );
                }
                else
                {
                    let transform_src = '', open_braces = 0;

                    while( !line ){ line = syntax.lines[++syntax.line].trim() }
                    
                    while( true )
                    {
                        transform_src += line + '\n';

                        if( open_braces += line.split( JS_SCOPE_RE ).filter( t => t === '{' || t === '}' ).reduce(( b, t ) => b += t === '{' ? 1 : -1, 0 ))
                        {
                            line = syntax.lines[++syntax.line].trim();
                        }
                        else{  break; }
                    }
                    
                    transform = new Function( 'scope', transform_match.groups.variable, 'with( scope ){ ' + transform_src + ' }' );
                }

                ++syntax.line;
            }
        }

        return transform;
    }

    _parseTokens( syntax )
    {
        let tokens = [], token_match; syntax.position = 0;

        do
        {
            TOKEN_RE.lastIndex = syntax.position;

            token_match = ( TOKEN_RE.lastIndex = syntax.position, TOKEN_RE.exec( syntax.lines[syntax.line] ));

            if( !token_match ){ throw { type: 'Token', line: syntax.lines[syntax.line], lineNo: syntax.line + 1, linePosition: syntax.position + 1 }}

            tokens.push( this.#cache.tokens.get( token_match[1], () =>
            {
                let options = token_match.groups;
                let token = options.node 
                    ? this.#cache.nodes.get( options.node, () => new Node() )
                    : (  options.variable 
                        ? this.#cache.variables.get( options.variable, () => new Variable( options.variable ))
                        : this.#cache.terminals.get( options.string || options.regexp, () => new Terminal( Util.compileRE( options.string || options.regexp, 'y' ))));
                
                if( options.delimiter )
                {
                    options.delimiter = options.delimiter[0] === ':'
                        ? this.#cache.nodes.get( options.delimiter.substr(1), () => new Node() )
                        : this.#cache.terminals.get( options.delimiter, () => new Terminal( Util.compileRE( options.delimiter, 'y' )));
                }

                return new Token( token, options );
            }));
        }
        while(( syntax.position += token_match[0].length ) && syntax.position < syntax.lines[syntax.line].length )

        return tokens;
    }

    parse( source, scope )
    {
        let parsed = this.#root.parse( scope = { Util, ...scope, __max_caret: 0 }, source, 0,  );

        if( !parsed || parsed.caret < source.length )
        {
            throw new Error( 'Fail at ' + source.substr( scope.__max_caret - 5, 20 ));
        }

        //console.log( source.length, parsed.caret );

        return parsed.data;
    }
}