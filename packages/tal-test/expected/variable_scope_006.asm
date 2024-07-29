main()
  entry:
    FunctionRef       name: root_function_0
    DeclareLocal      name: root_function, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "a"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             root_function
    Call
    DeclareLocal      name: a, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "b"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             root_function
    Call
    DeclareLocal      name: b, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Local             a
    Call
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Local             b
    Call
root_function_0(value)
  entry:
    FunctionRef       name: func_1
    MakeArrayForBlock count: 1
func_1()
  entry:
    Local             value
