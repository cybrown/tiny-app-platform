main()
  entry:
    FunctionRef       name: add_0
    DeclareLocal      name: add, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "add"
    Local             add
    Literal           1
    MakeRecord
add_0(a, b)
  entry:
    Local             a
    Local             b
    Intrinsic         INTRINSIC_ADD
    MakeArrayForBlock count: 1
