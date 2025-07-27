main()
  entry:
    Literal           "a"
    Literal           3
    Literal           1
    MakeRecord
    Literal           1
    MakeArray
    DeclareLocal      name: toto, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    DeclareLocal      name: index, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             index
    Local             toto
    Index
    Literal           42
    SetAttribute      name: a, forceRender: true
    Pop               inBlock: false
    Literal           "index"
    Local             toto
    Index
    Literal           42
    SetAttribute      name: a, forceRender: true
    Pop               inBlock: false
    Local             index
    Local             toto
    Index
    Attribute         name: a
