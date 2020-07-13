const SPECIAL_CHARS_RE = /[.+*?|^$(){}\[\]\\]/g;
const RECURSIVE_RE = /\(\?R\)/g;
const ESCAPED_RE = /\\(u\{([0-9A-Fa-f]+)\}|u([0-9A-Fa-f]{4})|x([0-9A-Fa-f]{2})|([1-7][0-7]{0,2}|[0-7]{2,3})|(['"tbrnfv0\\]))|\\U([0-9A-Fa-f]{8})/g;
const HTML_ENTITIES_RE = /[&<>"']/g;
const HTML_ENTITIES = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;', '&': '&amp;' };
const commonEscapes =
{
    '0': '\0',
    'b': '\b',
    'f': '\f',
    'n': '\n',
    'r': '\r',
    't': '\t',
    'v': '\v',
    '\'': '\'',
    '"': '"',
    '\\': '\\'
};

const Util = module.exports = 
{
    compileRE: function( str, flags = '' )
    {
        let re;

        if( str[0] === '/' )
        {
            let re_end = str.lastIndexOf('/');

            re = str.substring( 1, re_end ).replace( /\\./, m => m[1] === '/' ? '/' : m );
            flags += str.substring( re_end + 1 );
        }
        else
        {
            re = Util.unescape( str.substring( 1, str.length - 1 )).replace( SPECIAL_CHARS_RE, c => '\\' + c );
        }

        return new RegExp( re, flags );
    },
    unescape: function( str )
    {
        return str.replace( ESCAPED_RE, ( _, __, varHex, longHex, shortHex, octal, specialCharacter, python ) =>
        {
            if( varHex || longHex || shortHex || python ){ return String.fromCodePoint( parseInt(( varHex || longHex || shortHex || python ), 16 ))}
            if( octal ){ return String.fromCodePoint( parseInt( octal, 8 ))}
    
            return commonEscapes[specialCharacter];
        });
    },
    htmlentities: function( str )
    {
        return str.replace( HTML_ENTITIES_RE, c => HTML_ENTITIES[c] );
    }
}