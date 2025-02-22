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
        // Handle array for a[1] in case it's a minus operator with a check
        return right.map(a => ({ location: buildLocation(), kind: "BinaryOperator", operator: Array.isArray(a[1]) ? a[1][0] : a[1], right: a[3]}))
            .reduce((left, right) => {
                right.left = left;
                return right;
            }, left);
    }

    function buildLocation() {
        return {...location(), path: options.path};
    }

    function mergeLocation(a, b) {
        if (!a) return b;
        if (!b) return a;

        return {
            start: a.start,
            end: b.end,
        };
    }
}

Document
	= _ node:(TopLevelNode _)*
        { return node.map(e => ({ ...e[0], newLines: e[1] ?? 0 })); }

TopLevelNode
    = 'export' __ node:Node
        {
            options.onNode && options.onNode(node);
            return { location: buildLocation(), kind: 'Export', node };
        }
    / node:Node
        {
            options.onNode && options.onNode(node);
            return node;
        }

Node
    = CatchNode

CatchNode
    = node:PipeNode catchNodeArray:(_ 'catch' _ Node)?
        {
            if (!catchNodeArray) return node;
            const catchNode = catchNodeArray ? catchNodeArray[3] : undefined
            return { location: buildLocation(), kind: "Try", hasOnlyCatchKeyword: true, node, catchNode };
        }

PipeNode
	= first:ShellLikeCommand tail:(_ '|' _ ShellLikeCommand)*
    	{
            if (tail.length == 0) return first;
            return {
                location: buildLocation(),
                kind: "Pipe",
                first,
                values: tail.map(a => a[3])
            };
        }

ShellLikeCommand
    = value:LogicalOrOperator args:(__SameLine ShellFunctionArgument)*
        {
            if (!args || args.length == 0) {
                return value;
            }

            return {
                location: buildLocation(),
                kind: "Call",
                shell: true,
                value,
                args: args.map(a => a[1])
            };
        }

ShellFunctionArgument
    = ShellNamedArgument
    / ShellPositionalArgument

ShellPositionalArgument
	= node:LogicalOrOperator
    	{ return { location: buildLocation(), kind: "PositionalArgument", value: node }; }

ShellNamedArgument
    = name:Identifier _SameLine ':' _SameLine value:LogicalOrOperator
        { return { location: buildLocation(), kind: "NamedArgument", name, value }; }
    / '-' value:('-'/'!') name:Identifier
        {
            return {
                location: buildLocation(),
                kind: "NamedArgument",
                name,
                value: { location: buildLocation(), kind: "Literal", value: value === '-' },
                short: value === '-',
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
	= left:MultiplicationOperators right:(_ ('+' / ('-' !('-'/'!'))) _ MultiplicationOperators)*
        // We don't want to parse -- and -! because they're reserved for named arguments
    	{ return buildBinaryOperator(left, right); }

MultiplicationOperators
	= left:UnaryPrefixOperatorNode right:(_ ('*' / '/' / '%') _ UnaryPrefixOperatorNode)*
    	{ return buildBinaryOperator(left, right); }

UnaryPrefixOperatorNode
	= operator:("-" / "+" / "!") _ operand:NodeLevel2
     	{
            return { location: buildLocation(), kind: "UnaryOperator", operator, operand };
        }
	/ node:NodeLevel2
     	{
            return node;
        }

NodeLevel2 // Dotted, indexed and call nodes
	= node:NodeLevel1 field:NodeLevel2Right*
        {
            return field.reduce((prev, cur) => ({ ...cur, location: mergeLocation(prev.location, cur.location), value: prev }), node);
        }

NodeLevel2Right
	= DottedNodeTail
    / _SameLine '[' _ index:Node _ ']'
    	{ return { location: buildLocation(), kind: 'Index', index }; }
    / _SameLine "(" _ values:(FunctionArgument _ ','? _)* ")" isLambda:((_ '=>') ?)
        & { return !isLambda; }
        { return { location: buildLocation(), kind: "Call", args: values.map(a => a[0]) }; }

FunctionArgument
    = NamedArgument
    / PositionalArgument

PositionalArgument
	= node:Node
    	{ return { location: buildLocation(), kind: "PositionalArgument", value: node }; }

NamedArgument
    = name:Identifier _ ':' _ value:Node
        { return { location: buildLocation(), kind: "NamedArgument", name, value }; }
    / '-' value:('-'/'!') name:Identifier
        {
            return {
                location: buildLocation(),
                kind: "NamedArgument",
                name,
                value: { location: buildLocation(), kind: "Literal", value: value === '-' },
                short: value === '-',
            };
        }

NodeLevel1
    = Null
    / Boolean
    / If
    / While
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
    / Block
    / String
    / Number
    / Array
    / Nested
    / Comment
    / AttributeLambdaSugar

AttributeLambdaSugar
    = '.' _ key:Identifier
        { return { location: buildLocation(), kind: "AttributeLambdaSugar", key }; }

Comment
    = '//' text:Comment_text '\n' _ node:Node?
        { return { location: buildLocation(), kind: "Comment", text, node }; }

Comment_text
    = [^\n]*
        { return text(); }

Import
    = 'import' __ path:RawString
        { return { location: buildLocation(), kind: "Import", path }; }

If
    = 'if' _ '(' _ condition:Node _ ')' _ ifTrue:Node ifFalseArray:(_ 'else' _ (If / Node))?
        {
            const ifFalse = ifFalseArray ? ifFalseArray[3] : undefined
            return { location: buildLocation(), kind: "If", condition, ifTrue, ifFalse };
        }

While
    = 'while' _ '(' _ condition:Node _ ')' _ body:Node
        {
            return { location: buildLocation(), kind: "While", condition, body };
        }

Switch
    = 'switch' _ value:('(' _ Node _ ')' _)? '{' _ branches:(SwitchBranch _)* defaultBranch:SwitchDefaultBranch? _ '}'
        {
            return { location: buildLocation(), kind: "Switch", value: value ? value[2] : null, branches: branches.map(e => e[0]), defaultBranch };
        }

SwitchBranch
    // Parse true, false and null first to avoid parsing them as identifiers
    = comparator:(Boolean / Null) _ '=>' _ value:Node
        { return { location: buildLocation(), kind: "SwitchBranch", comparator, value }; }
    // Parse identifiers first to avoid parsing node as a single parameter lambda
    / comparator:Local _ '=>' _ value:Node
        { return { location: buildLocation(), kind: "SwitchBranch", comparator, value }; }
    / comparator:Node _ '=>' _ value:Node
        { return { location: buildLocation(), kind: "SwitchBranch", comparator, value }; }

SwitchDefaultBranch
    = '_' _ '=>' _ value: Node
        { return { value }; }

Try
    // Parse PipeNode instead of CatchNode to avoid parsing catch two times
    = 'try' _ node:ShellLikeCommand catchNodeArray:(_ 'catch' _ Node)?
        {
            const catchNode = catchNodeArray ? catchNodeArray[3] : undefined
            return { location: buildLocation(), kind: "Try", node, catchNode };
        }

Nested
	= '(' _ node:Node _ ')'
    	{ return { location: buildLocation(), kind: 'Nested', node }; }

NamedFunction
    = 'fun' __ name:Identifier _ '(' _ parameters:(Identifier _ (',' _)?)* ')' _ body:Node
        { return { location: buildLocation(), kind: "DeclareLocal", mutable: false, name, value: { location: buildLocation(), kind: "Function", body: body, parameters: parameters.map(parameter => parameter[0]) } } }

Function
    = '(' _ parameters:(Identifier _ (',' _)?)* ')' _ '=>' _ body:Node
        { return { location: buildLocation(), kind: "Function", body: body, parameters: parameters.map(parameter => parameter[0]) }; }
    / parameter:(Identifier) _ '=>' _ body:Node
        { return { location: buildLocation(), kind: "Function", body: body, parameters: [parameter] }; }

KindedRecord
    = kind:DottedNode _SameLine "{" _ values:((KindedRecordEntry / Node) _ ','? _)* "}"
        {
            const children = values.filter(a => a[0].kind !== "KindedRecordEntry")
                .map(a => ({ ...a[0], newLines: (a[1] ?? 0) + (a[3] ?? 0) }));
            return {
                location: buildLocation(),
                kind: "KindedRecord",
                kindOfRecord: kind,
                children: children,
                entries: values.map(a => a[0])
                               .filter(a => a.kind === "KindedRecordEntry")
            };
        }

DottedNode
    = first:Local tail:DottedNodeTail*
        { return tail.reduce((prev, cur) => ({ ...cur, value: prev }), first); }

DottedNodeTail
	= '.' _ key:Identifier
    	{ return { location: buildLocation(), kind: 'Attribute', key }; }

KindedRecordEntry
    = key:RecordKey _ ":" _ value:Node
    	{
            if (key === 'kind') {
                error("Record with kind must not have a key called 'kind'")
            }
            if (key === 'children') {
                error("Record with kind must not have a key called 'children'")
            }
            return { location: buildLocation(), kind: 'KindedRecordEntry', key, value };
        }
    / '-' value:('-' / '!') key:RecordKey
    	{
            if (key === 'kind') {
                error("Record with kind must not have a key called 'kind'")
            }
            if (key === 'children') {
                error("Record with kind must not have a key called 'children'")
            }
            return {
                location: buildLocation(),
                kind: 'KindedRecordEntry',
                key,
                value: { location: buildLocation(), kind: "Literal", value: value === '-' },
                short: value === '-',
            };
        }

Record
	= "{" _ entries:(RecordEntry _)* "}"
    	{ return { location: buildLocation(), kind: "Record", entries: entries.map(a => a[0]) }; }

RecordEntry
	= key:RecordKey _ ':' _ value:Node (_ ',')?
    	{ return { location: buildLocation(), kind: "RecordEntry", key, value } }

RecordKey
    = Identifier
    / RawString

Array
	= '[' _ nodes:(Node _ ','? _ )* ']'
    	{ return { location: buildLocation(), kind: "Array", value: nodes.map(e => ({ ...e[0], newLines: (e[1] ?? 0) + (e[3] ?? 0) })) }; }

Local
    = id:Identifier
        & { return !["catch", "else"].includes(id); }
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
    	{ return { location: buildLocation(), kind: "Literal", value }; }

Number
	= num:[0-9]+ '.' num2:[0-9]*
    	{ return { location: buildLocation(), kind: "Literal", value: Number([...num, '.', ...num2].join('')) }; }
	/ num:[0-9]+
    	{ return { location: buildLocation(), kind: "Literal", value: Number([...num].join('')) }; }
	/ '.' num:[0-9]+
    	{ return { location: buildLocation(), kind: "Literal", value: Number(['.', ...num].join('')) }; }

Boolean
	= bool:("true" / "false") ! IdentifierTailCharacters
    	{ return { location: buildLocation(), kind: "Literal", value: bool === "true" }; }

Null
	= "null" ! IdentifierTailCharacters
    	{ return { location: buildLocation(), kind: "Literal", value: null }; }

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
    = "set" __ address:Node _ '=' _ value:Node
        { return { location: buildLocation(), kind: "Assign", address, value }; }

LocalDeclaration
    = keyword:("let" / "var") ! IdentifierTailCharacters __ name:Identifier value:(_ '=' _ Node)?
        { return { location: buildLocation(), kind: "DeclareLocal", mutable: keyword === "var", name, value: value != null ? value[3] : undefined }; }

Block
    = "{" _ children:ManyNodes "}"
        { return { location: buildLocation(), kind: "Block", children }; }

ManyNodes
    = nodes:(Node _ ','? _)*
        { return nodes.map(e => ({ ...e[0], newLines: (e[1] ?? 0) + (e[3] ?? 0) })); }

_ "whitespace on multiple lines"
	= chars:([ \t\n\r]*)
    	{ return [...chars].filter(c => c === "\n").length; }

__ "mandatory whitespace on multiple lines"
	= chars:([ \t\n\r]+)
    	{ return [...chars].filter(c => c === "\n").length; }

_SameLine "whitespace on the same line"
	= chars:([ \t]*)
    	{ return 0; }

__SameLine "mandatory whitespace on the same line"
	= chars:([ \t]+)
    	{ return 0; }
