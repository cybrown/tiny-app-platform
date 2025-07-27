main()
  entry:
    Literal           "a"
    Literal           "ok"
    Literal           "b"
    Literal           "ok2"
    Literal           "ce"
    Literal           "3"
    Literal           3
    MakeRecord
    DeclareLocal      name: b, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "ce"
    Local             b
    Index
    DeclareLocal      name: c, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             c
