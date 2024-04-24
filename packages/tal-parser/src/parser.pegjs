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

    function buildBinaryOperator(left, right) {
        if (right.length == 0) return left;
        return right.map(a => ({ location: buildLocation(), kind: "BinaryOperator", operator: a[1], right: a[3]}))
            .reduce((left, right) => {
                right.left = left;
                return right;
            }, left);
    }

    function buildLocation() {
        return {...location(), path: options.path};
    }
}

Document
	= _ expr:(TopLevelExpression _)*
        { return expr.map(e => ({ ...e[0], newLines: e[1] ?? 0 })); }

TopLevelExpression
    = 'export' __ expr:Expression
        { return { kind: 'Export', expr }; }
    / Expression

Expression
    = PipeExpression

PipeExpression
	= first:LogicalOrOperator tail:(_ '|' _ LogicalOrOperator)*
    	{
            if (tail.length == 0) return first;
            return {
                location: buildLocation(),
                kind: "Pipe",
                first,
                values: tail.map(a => a[3])
            };
        }

LogicalOrOperator
	= left:LogicalAndOperator right:(_ '||' _ LogicalAndOperator)*
    	{ return buildBinaryOperator(left, right); }

LogicalAndOperator
	= left:EqualityOperators right:(_ '&&' _ EqualityOperators)*
    	{ return buildBinaryOperator(left, right); }

EqualityOperators
	= left:ComparisonOperators right:(_ ('===' / '!==' / '==' / '!=') _ ComparisonOperators)*
    	{ return buildBinaryOperator(left, right); }

ComparisonOperators
	= left:PlusAndMinusOperators right:(_ ('<=' / '>=' / '<' / '>') _ PlusAndMinusOperators)*
    	{ return buildBinaryOperator(left, right); }

PlusAndMinusOperators
	= left:MultiplicationOperators right:(_ ('+' / '-') _ MultiplicationOperators)*
    	{ return buildBinaryOperator(left, right); }

MultiplicationOperators
	= left:UnaryPrefixOperatorExpression right:(_ ('*' / '/' / '%') _ UnaryPrefixOperatorExpression)*
    	{ return buildBinaryOperator(left, right); }

UnaryPrefixOperatorExpression
	= operator:("-" / "+" / "!")? _ operand:ExpressionLevel2
     	{
            if (!operator) return operand;
            return { location: buildLocation(), kind: "UnaryOperator", operator, operand };
        }

ExpressionLevel2 // Dotted and indexed expression
	= expr:ExpressionLevel1 field:ExpressionLevel2Right*
        {
            return field.reduce((prev, cur) => ({ ...cur, value: prev }), expr);
        }

ExpressionLevel2Right
	= DottedExpressionTail
    / _ '[' _ index:Expression _ ']'
    	{ return { location: buildLocation(), kind: 'Index', index }; }
    / _ "(" _ values:(FunctionArgument _ ','? _)* ")" isLambda:((_ '=>') ?)
        & { return !isLambda; }
        { return { location: buildLocation(), kind: "Call", args: values.map(a => a[0]) }; }

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
    / Assignement
    / LocalDeclaration
    / NamedFunction
    / Function
	/ KindedRecord
    / Local
    / Record
    / BlockOfExpressions
    / String
    / Number
    / Array
    / SubExpression
    / Comment

Comment
    = '//' text:Comment_text '\n' _ expr:Expression?
        { return { location: buildLocation(), kind: "Comment", text, expr }; }

Comment_text
    = [^\n]*
        { return text(); }

Import
    = 'import' __ path:RawString
        { return { location: buildLocation(), kind: "Import", path }; }

If
    = 'if' _ '(' _ condition:Expression _ ')' _ ifTrue:BlockOfExpressions ifFalseArray:(_ 'else' _ (BlockOfExpressions / If))?
        {
            const ifFalse = ifFalseArray ? ifFalseArray[3] : undefined
            return { location: buildLocation(), kind: "If", condition, ifTrue, ifFalse };
        }

Switch
    = 'switch' _ value:('(' _ Expression _ ')' _)? '{' _ branches:(SwitchBranch _)* defaultBranch:SwitchDefaultBranch? _ '}'
        {
            return { location: buildLocation(), kind: "Switch", value: value ? value[2] : null, branches: branches.map(e => e[0]), defaultBranch };
        }

SwitchBranch
    // Parse true, false and null first to avoid parsing them as identifiers
    = comparator:(Boolean / Null) _ '=>' _ value:Expression
        { return { comparator, value }; }
    // Parse identifiers first to avoid parsing expression as a single parameter lambda
    / comparator:Local _ '=>' _ value:Expression
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
            return { location: buildLocation(), kind: "Try", expr, catchBlock };
        }

SubExpression
	= '(' _ expr:Expression _ ')'
    	{ return { location: buildLocation(), kind: 'SubExpression', expr }; }

NamedFunction
    = 'fun' __ name:Identifier _ '(' _ parameters:(Identifier _ (',' _)?)* ')' _ body:Expression
        { return { location: buildLocation(), kind: "DeclareLocal", mutable: false, name, value: { location: buildLocation(), kind: "Function", body: body, parameters: parameters.map(parameter => parameter[0]) } } }

Function
    = '(' _ parameters:(Identifier _ (',' _)?)* ')' _ '=>' _ body:Expression
        { return { location: buildLocation(), kind: "Function", body: body, parameters: parameters.map(parameter => parameter[0]) }; }
    / parameter:(Identifier) _ '=>' _ body:Expression
        { return { location: buildLocation(), kind: "Function", body: body, parameters: [parameter] }; }

KindedRecord
    = kind:DottedExpression _ "{" _ values:((KindedRecordKeyValuePair / Expression) _ ','? _)* "}"
        {
            const children = values.filter(a => !Array.isArray(a[0]))
                .map(a => ({ ...a[0], newLines: (a[1] ?? 0) + (a[3] ?? 0) }));
            return {
                location: buildLocation(),
                kind: "KindedRecord",
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
    	{ return { location: buildLocation(), kind: 'Attribute', key }; }

KindedRecordKeyValuePair
    = key:RecordKey _ ":" _ value:Expression
    	{
            if (key === 'kind') {
                error("Record with kind must not have a key called 'kind'")
            }
            if (key === 'children') {
                error("Record with kind must not have a key called 'children'")
            }
            return [key, value];
        }

Record
	= "{" _ entries:(RecordKeyValuePair _)* "}"
    	{ return { location: buildLocation(), kind: "Record", value: Object.fromEntries(entries.map(a => a[0])) }; }

RecordKeyValuePair
	= key:RecordKey _ ':' _ value:Expression (_ ',')?
    	{ return [key, value]; }

RecordKey
    = Identifier
    / RawString

Array
	= '[' _ expressions:(Expression _ ','? _ )* ']'
    	{ return { location: buildLocation(), kind: "Array", value: expressions.map(e => ({ ...e[0], newLines: (e[1] ?? 0) + (e[3] ?? 0) })) }; }

Local
    = id:Identifier
    	{ return { location: buildLocation(), kind: 'Local', name: id}; }

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
    = "set" __ address:Expression _ '=' _ value:Expression
        { return { location: buildLocation(), kind: "Assign", address, value }; }

LocalDeclaration
    = keyword:("let" / "var") ! IdentifierTailCharacters __ name:Identifier value:(_ '=' _ Expression)?
        { return { location: buildLocation(), kind: "DeclareLocal", mutable: keyword === "var", name, value: value != null ? value[3] : undefined }; }

BlockOfExpressions
    = "{" _ children:ManyExpressions "}"
        { return { location: buildLocation(), kind: "BlockOfExpressions", children }; }

ManyExpressions
    = expressions:(Expression _ ','? _)*
        { return expressions.map(e => ({ ...e[0], newLines: (e[1] ?? 0) + (e[3] ?? 0) })); }

_ "whitespace"
	= chars:([ \t\n\r]*)
    	{ return [...chars].filter(c => c === "\n").length; }

__ "mandatory whitespace"
	= chars:([ \t\n\r]+)
    	{ return [...chars].filter(c => c === "\n").length; }
