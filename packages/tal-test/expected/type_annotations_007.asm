main()
  entry:
    FunctionRef       name: a_0
    DeclareLocal      name: a, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: b_1
    DeclareLocal      name: b, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           1
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             a
    Call
a_0(value)
  entry:
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Local             b
    Call
    Local             value
    Intrinsic         INTRINSIC_ADD
    MakeArrayForBlock count: 1
b_1()
  entry:
    Literal           3
    MakeArrayForBlock count: 1
