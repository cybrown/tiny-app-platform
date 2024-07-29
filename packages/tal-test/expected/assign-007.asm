main()
  entry:
    Literal           0
    MakeRecord
    DeclareLocal      name: toto, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             toto
    Literal           "value"
    SetAttribute      name: property, forceRender: true
    Pop               inBlock: false
    Local             toto
    Attribute         name: property
