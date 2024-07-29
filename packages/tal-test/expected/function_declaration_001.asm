main()
  entry:
    FunctionRef       name: f_0
    DeclareLocal      name: f, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           "x"
    Literal           2
    Literal           1
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           2
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             f
    Call
f_0(x)
  entry:
    Local             x
    Literal           1
    Intrinsic         INTRINSIC_ADD
