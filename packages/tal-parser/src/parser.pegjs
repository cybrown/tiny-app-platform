Document
	= _ expr:(Expression _)* { return expr.map(e => ({ ...e[0], newLines: e[1] ?? 0 })); }

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
	= _ '.' _ key:Identifier
    	{ return { location: location(), kind: 'Attribute', key }; }
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

If
    = 'if' _ '(' _ condition:Expression _ ')' _ ifTrue:BlockOfExpressions ifFalseArray:(_ 'else' _ (BlockOfExpressions / If))?
        {
            const ifFalse = ifFalseArray ? ifFalseArray[3] : undefined
            return { location: location(), kind: "If", condition, ifTrue, ifFalse };
        }

Switch
    = 'switch' _ '(' _ value:Expression _ ')' _ '{' _ branches:(SwitchBranch _)* defaultBranch:SwitchDefaultBranch? _ '}'
        {
            return { location: location(), kind: "Switch", value, branches: branches.map(e => e[0]), defaultBranch };
        }

SwitchBranch
    = comparator:Expression _ '=>' _ value:Expression
        { return { comparator, value }; }

SwitchDefaultBranch
    = '*' _ '=>' _ value: Expression
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

ObjectWithKind
    = kind:Identifier _ "{" _ values:((ObjectWithKindKeyValuePair / Expression) _ ','? _)* "}"
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
    / str:String
        { return str.value; }

Array
	= '[' _ expressions:(Expression _ ','? _ )* ']'
    	{ return { location: location(), kind: "Array", value: expressions.map(e => ({ ...e[0], newLines: (e[1] ?? 0) + (e[3] ?? 0) })) }; }

Local
    = id:Identifier
    	{ return { location: location(), kind: 'Local', name: id}; }

String
	= "\"" str:([^"\\] / '\\n' )* "\""
    	{ return { kind: "Literal", value: str.map(a => a == '\\n' ? '\n' : a).join('') }; }
	/ "'" str:[^']* "'"
    	{ return { kind: "Literal", value: str.map(a => a == '\\n' ? '\n' : a).join('') }; }

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
    = head:IdentifierHeadCharacters tail:IdentifierTailCharacters*
    	{ return head + tail.join(''); }
    / '@' str:String
    	{ return str.value;}

IdentifierHeadCharacters
    = [A-Za-z_$]

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
