main()
  entry:
    FunctionRef       name: myFunc_0
    DeclareLocal      name: myFunc, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_1
    Pop               inBlock: false
    Literal           3
    DeclareLocal      name: myNumber, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    DeclareLocal      name: myObject, mutable: false, hasInitialValue: false
myFunc_0(a, b)
  entry:
    Literal           3
    MakeArrayForBlock count: 1
func_1(a, data)
  entry:
    Literal           42
