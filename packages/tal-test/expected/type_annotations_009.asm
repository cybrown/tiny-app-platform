main()
  entry:
    DeclareLocal      name: a, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    Literal           3
    DeclareLocal      name: b, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           3
    DeclareLocal      name: c, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "a"
    Local             a
    Literal           "b"
    Local             b
    Literal           "c"
    Local             c
    Literal           3
    MakeRecord
