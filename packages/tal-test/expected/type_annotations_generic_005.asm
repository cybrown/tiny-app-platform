main()
  entry:
    FunctionRef       name: pair_0
    DeclareLocal      name: pair, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "ok"
    Literal           4
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             pair
    Call
pair_0(item1, item2)
  entry:
    Literal           "a"
    Local             item1
    Literal           "b"
    Local             item2
    Literal           2
    MakeRecord
    MakeArrayForBlock count: 1
