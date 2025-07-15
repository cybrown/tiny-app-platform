main()
  entry:
    FunctionRef       name: string_split_0
    DeclareLocal      name: string_split, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "toto"
    Literal           " "
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             string_split
    Call
    DeclareLocal      name: arr, mutable: false, hasInitialValue: true
string_split_0(a, b)
  entry:
    Local             a
    Literal           1
    MakeArray
    MakeArrayForBlock count: 1
