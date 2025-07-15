main()
  entry:
    Literal           "a"
    Literal           32
    Literal           "b"
    Literal           "4"
    Literal           2
    MakeRecord
    DeclareLocal      name: i1, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "a"
    Literal           32
    Literal           "b"
    Literal           "4"
    Literal           "c"
    Literal           3
    Literal           3
    MakeRecord
    DeclareLocal      name: i2, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "a"
    Literal           32
    Literal           1
    MakeRecord
    DeclareLocal      name: i3, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "a"
    Literal           32
    Literal           "b"
    Literal           0
    Literal           2
    MakeRecord
    DeclareLocal      name: i4, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "b"
    Literal           "4"
    Literal           "c"
    Literal           3
    Literal           2
    MakeRecord
    DeclareLocal      name: i5, mutable: true, hasInitialValue: true
