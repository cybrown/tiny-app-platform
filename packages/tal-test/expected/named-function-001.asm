main()
  entry:
    FunctionRef       name: add_0
    DeclareLocal      name: add, mutable: false, hasInitialValue: true
add_0(a, b)
  entry:
    Local             a
    Local             b
    Intrinsic         INTRINSIC_ADD
