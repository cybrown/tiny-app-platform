main()
  entry:
    FunctionRef       name: f_0
    DeclareLocal      name: f, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal 0
    MakeArray
    Literal "x"
    Literal 2
    Literal 1
    MakeRecord
    Local             name: f
    Call
    Pop               inBlock: false
    Literal 2
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: f
    Call
f_0([object Object])
  entry:
    Local             name: x
    Literal 1
    Intrinsic         operation: INTRINSIC_ADD
