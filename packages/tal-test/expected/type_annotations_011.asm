main()
  entry:
    Literal           0
    MakeArray
    DeclareLocal      name: a, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           null
    Local             a
    Intrinsic         INTRINSIC_NOT_EQUAL
