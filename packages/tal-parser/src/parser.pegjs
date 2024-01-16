{
	const escapeSequences = {
    	"\\0": "\0",
    	"\\n": "\n",
    	"\\t": "\t",
    	"\\v": "\v",
    	"\\f": "\f",
    	"\\r": "\r",
    	'\\"': '"',
    	"\\'": "'",
    	'\\\\': '\\',
    }
}

Document
	= _ expr:(TopLevelExpression _)* { return expr.map(e => ({ ...e[0], newLines: e[1] ?? 0 })); }

TopLevelExpression
    = 'export' _ expr:Expression
        { return { kind: 'Export', expr }; }
    / Expression

Expression
    = PipeExpression

PipeExpression
	= first:LogicalOrOperator tail:(_ ('|?' / '|!' / '|') _ LogicalOrOperator)*
    	{ return tail.length == 0 ? first : { location: location(), kind: "Pipe", first, values: tail.map(a => ({pipeKind: a[1], value: a[3]})) }; }

LogicalOrOperator
	= left:LogicalAndOperator right:(_ '||' _ LogicalAndOperator)*
    	{ return right.length == 0 ? left : right.map(a => ({ location: location(), kind: "BinaryOperator", operator: a[1], right: a[3]})).reduce((left, right) => (right.left = left, right), left); }

LogicalAndOperator
	= left:EqualityOperators right:(_ '&&' _ EqualityOperators)*
    	{ return right.length == 0 ? left : right.map(a => ({ location: location(), kind: "BinaryOperator", operator: a[1], right: a[3]})).reduce((left, right) => (right.left = left, right), left); }

EqualityOperators
	= left:ComparisonOperators right:(_ ('===' / '!==' / '==' / '!=') _ ComparisonOperators)*
    	{ return right.length == 0 ? left : right.map(a => ({ location: location(), kind: "BinaryOperator", operator: a[1], right: a[3]})).reduce((left, right) => (right.left = left, right), left); }

ComparisonOperators
	= left:PlusAndMinusOperators right:(_ ('<=' / '>=' / '<' / '>') _ PlusAndMinusOperators)*
    	{ return right.length == 0 ? left : right.map(a => ({ location: location(), kind: "BinaryOperator", operator: a[1], right: a[3]})).reduce((left, right) => (right.left = left, right), left); }

PlusAndMinusOperators
	= left:MultiplicationOperators right:(_ ('+' / '-') _ MultiplicationOperators)*
    	{ return right.length == 0 ? left : right.map(a => ({ location: location(), kind: "BinaryOperator", operator: a[1], right: a[3]})).reduce((left, right) => (right.left = left, right), left); }

MultiplicationOperators
	= left:UnaryPrefixOperatorExpression right:(_ ('*' / '/' / '%') _ UnaryPrefixOperatorExpression)*
    	{ return right.length == 0 ? left : right.map(a => ({ location: location(), kind: "BinaryOperator", operator: a[1], right: a[3]})).reduce((left, right) => (right.left = left, right), left); }

UnaryPrefixOperatorExpression
	= operator:("-" / "+" / "!" / "&")? _ operand:ExpressionLevel2
     	{ return operator == null ? operand : (operator == "&" ? { location: location(), kind: "Provided", key: operand } : { location: location(), kind: "UnaryOperator", operator, operand }); }

ExpressionLevel2 // Dotted and indexed expression
	= expr:ExpressionLevel1 field:ExpressionLevel2Right*
        { return field.reduce((prev, cur) => ({ ...cur, value: prev }), expr); }

ExpressionLevel2Right
	= DottedExpressionTail
    / _ '[' _ index:Expression _ ']'
    	{ return { location: location(), kind: 'Index', index }; }
    / _ "(" _ values:(FunctionArgument _ ','? _)* ")" isLambda:((_ '=>') ?)
        & { return !isLambda; }
        { return { location: location(), kind: "Call", args: values.map(a => a[0]) }; }

FunctionArgument
    = NamedArgument
    / PositionalArgument

PositionalArgument
	= expr:Expression
    	{ return { argKind: "Positional", value: expr }; }

NamedArgument
    = name:Identifier _ ':' _ value:Expression
        { return { argKind: "Named", name, value }; }

ExpressionLevel1
    = Null
    / Boolean
    / If
    / Switch
    / Try
    / Import
    / Provide
    / Assignement
    / LocalDeclaration
    / NamedFunction
    / Function
	/ ObjectWithKind
    / Local
    / Object
    / BlockOfExpressions
    / String
    / Number
    / Array
    / SubExpression

Import
    = 'import' _ path:RawString
        { return { location: location(), kind: "Import", path }; }

If
    = 'if' _ '(' _ condition:Expression _ ')' _ ifTrue:BlockOfExpressions ifFalseArray:(_ 'else' _ (BlockOfExpressions / If))?
        {
            const ifFalse = ifFalseArray ? ifFalseArray[3] : undefined
            return { location: location(), kind: "If", condition, ifTrue, ifFalse };
        }

Switch
    = 'switch' _ value:('(' _ Expression _ ')' _)? '{' _ branches:(SwitchBranch _)* defaultBranch:SwitchDefaultBranch? _ '}'
        {
            return { location: location(), kind: "Switch", value: value ? value[2] : null, branches: branches.map(e => e[0]), defaultBranch };
        }

SwitchBranch
    // Parse identifiers first to avoid parsing expression as a single parameter lambda
    = comparator:Local _ '=>' _ value:Expression
        { return { comparator, value }; }
    / comparator:Expression _ '=>' _ value:Expression
        { return { comparator, value }; }

SwitchDefaultBranch
    = '_' _ '=>' _ value: Expression
        { return { value }; }

Try
    = 'try' _ expr:BlockOfExpressions catchBlockArray:(_ 'catch' _ BlockOfExpressions)?
        {
            const catchBlock = catchBlockArray ? catchBlockArray[3] : undefined
            return { location: location(), kind: "Try", expr, catchBlock };
        }

Provide
    = 'with' _  '(' _ entries:(ProvideKeyValuePair (_ ',')? _ )+ _ ')' _ body:BlockOfExpressions
        { return { location: location(), kind: "Provide", entries: entries.map(entry => entry[0]), body }; }

ProvideKeyValuePair
    = key:Expression _ '=' _ value:Expression
        { return { key, value}; }

SubExpression
	= '(' _ expr:Expression _ ')'
    	{ return { location: location(), kind: 'SubExpression', expr }; }

NamedFunction
    = 'fun' _ name:Identifier _ '(' _ parameters:(Identifier _ (',' _)?)* ')' _ body:Expression
        { return { location: location(), kind: "DeclareLocal", mutable: false, name, value: { location: location(), kind: "Function", body: body, parameters: parameters.map(parameter => parameter[0]) } } }

Function
    = '(' _ parameters:(Identifier _ (',' _)?)* ')' _ '=>' _ body:Expression
        { return { location: location(), kind: "Function", body: body, parameters: parameters.map(parameter => parameter[0]) }; }
    / parameter:(Identifier) _ '=>' _ body:Expression
        { return { location: location(), kind: "Function", body: body, parameters: [parameter] }; }

ObjectWithKind
    = kind:DottedExpression _ "{" _ values:((ObjectWithKindKeyValuePair / Expression) _ ','? _)* "}"
        {
            const children = values.filter(a => !Array.isArray(a[0]))
                .map(a => ({ ...a[0], newLines: (a[1] ?? 0) + (a[3] ?? 0) }));
            return {
                location: location(),
                kind: "KindedObject",
                value: {
                    kind: kind,
                    ...(children.length ? {children} : {}),
                    ...values.map(a => a[0]).reduce((prev, cur) => {
                        if (Array.isArray(cur)) {
                            prev[cur[0]] = cur[1];
                        }
                        return prev;
                    }, {})
                }
            };
        }

DottedExpression
    = first:Local tail:DottedExpressionTail*
        { return tail.reduce((prev, cur) => ({ ...cur, value: prev }), first); }

DottedExpressionTail
	= _ '.' _ key:Identifier
    	{ return { location: location(), kind: 'Attribute', key }; }

ObjectWithKindKeyValuePair
    = key:ObjectKey _ ":" _ value:Expression
    	{
            if (key === 'kind') {
                error("Object with kind must not have a key called 'kind'")
            }
            if (key === 'children') {
                error("Object with kind must not have a key called 'children'")
            }
            return [key, value];
        }

Object
	= "{" _ entries:(ObjectKeyValuePair _)* "}"
    	{ return { location: location(), kind: "Object", value: Object.fromEntries(entries.map(a => a[0])) }; }

ObjectKeyValuePair
	= key:ObjectKey _ ':' _ value:Expression (_ ',')?
    	{ return [key, value]; }

ObjectKey
    = Identifier
    / RawString

Array
	= '[' _ expressions:(Expression _ ','? _ )* ']'
    	{ return { location: location(), kind: "Array", value: expressions.map(e => ({ ...e[0], newLines: (e[1] ?? 0) + (e[3] ?? 0) })) }; }

Local
    = id:Identifier
    	{ return { location: location(), kind: 'Local', name: id}; }

RawString
	= '"' str:(DoubleQuoteStringCharacter*) '"'
    	{ return str.join(''); }
	/ "'" str:(SingleQuoteStringCharacter*) "'"
    	{ return str.join(''); }

DoubleQuoteStringCharacter
	= ! '"' chr:( EscapedDoubleQuote / EscapedCharacter / UnicodeCharacter / .)
    	{ return chr; }

SingleQuoteStringCharacter
	= ! "'" chr:( EscapedSingleQuote / EscapedCharacter / UnicodeCharacter / .)
    	{ return chr; }

EscapedDoubleQuote
	= '\\"'
    	{ return '"'; }

EscapedSingleQuote
	= "\\'"
    	{ return "'"; }

EscapedCharacter
	= chr:("\\n" / "\\0" / "\\t" / "\\v" / "\\f" / "\\r" / '\\"' / '\\\\' / '\\"' / "\\'" )
    	{ return escapeSequences[chr]; }

UnicodeCharacter
	= 'u' '{' hexValue:HexCharacter+ '}'
    	{ return String.fromCharCode(parseInt(hexValue.join(''), 16)); }

HexCharacter
	= [0123456789ABCDEFabcdef]

String
	= value:RawString
    	{ return { kind: "Literal", value }; }

Number
	= num:[0-9]+ '.' num2:[0-9]*
    	{ return { kind: "Literal", value: Number([...num, '.', ...num2].join('')) }; }
	/ num:[0-9]+
    	{ return { kind: "Literal", value: Number([...num].join('')) }; }
	/ '.' num:[0-9]+
    	{ return { kind: "Literal", value: Number(['.', ...num].join('')) }; }

Boolean
	= bool:("true" / "false") ! IdentifierTailCharacters
    	{ return { kind: "Literal", value: bool === "true" }; }

Null
	= "null" ! IdentifierTailCharacters
    	{ return { kind: "Literal", value: null }; }

Identifier
    // Only _ is not a valid identifier, but an identifier can start with _ and have other characters after
    = head:IdentifierHeadCharacters tail:IdentifierTailCharacters*
    	{ return head + tail.join(''); }
    / head:'_' tail:IdentifierTailCharacters+
    	{ return head + tail.join(''); }
    / '@' str:RawString
    	{ return str; }

IdentifierHeadCharacters
    = [A-Za-z$]

IdentifierTailCharacters
    = [A-Za-z_$0-9]

Assignement
    = "set" _ address:Expression _ '=' _ value:Expression
        { return { location: location(), kind: "Assign", address, value }; }

LocalDeclaration
    = keyword:("let" / "var") ! IdentifierTailCharacters _ name:Identifier value:(_ '=' _ Expression)?
        { return { location: location(), kind: "DeclareLocal", mutable: keyword === "var", name, value: value != null ? value[3] : undefined }; }

BlockOfExpressions
    = "{" _ children:ManyExpressions "}"
        { return { location: location(), kind: "BlockOfExpressions", children }; }

ManyExpressions
    = expressions:(Expression _ ','? _)*
        { return expressions.map(e => ({ ...e[0], newLines: (e[1] ?? 0) + (e[3] ?? 0) })); }

_ "whitespace"
	= chars:([ \t\n\r]*)
    	{ return [...chars].filter(c => c === "\n").length; }
