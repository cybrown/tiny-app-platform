main()
  entry:
    FunctionRef       name: box_0
    DeclareLocal      name: box, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           42
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             box
    Call
    Pop               inBlock: false
    Literal           42
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             box
    Call
box_0(item)
  entry:
    Literal           "value"
    Local             item
    Literal           1
    MakeRecord
    MakeArrayForBlock count: 1
