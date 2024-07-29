main()
  entry:
    FunctionRef       name: letterToNumber_0
    DeclareLocal      name: letterToNumber, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "a"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             letterToNumber
    Call
    Pop               inBlock: false
    Literal           "b"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             letterToNumber
    Call
    Pop               inBlock: false
    Literal           "c"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             letterToNumber
    Call
    Pop               inBlock: false
    Literal           "d"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             letterToNumber
    Call
letterToNumber_0(letter)
  entry:
    Literal           4
    MakeArrayForBlock count: 1
