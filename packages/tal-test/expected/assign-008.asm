main()
  entry:
    Literal           0
    MakeArray
    DeclareLocal      name: toto, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           3
    DeclareLocal      name: index, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             index
    Local             toto
    Literal           "value"
    SetIndex          forceRender: true
    Pop               inBlock: false
    Literal           3
    Local             toto
    Index
