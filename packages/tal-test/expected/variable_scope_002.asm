main()
  entry:
    Literal           "a"
    DeclareLocal      name: value, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: sub_function_0
    DeclareLocal      name: sub_function, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: root_function_1
    DeclareLocal      name: root_function, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Local             root_function
    Call
sub_function_0()
  entry:
    Local             value
    MakeArrayForBlock count: 1
root_function_1()
  entry:
    Literal           "b"
    DeclareLocal      name: value, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Local             sub_function
    Call
    MakeArrayForBlock count: 2
