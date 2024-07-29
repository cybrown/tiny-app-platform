main()
  entry:
    Literal 0
    MakeRecord
    DeclareLocal      name: toto, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: toto
    Literal "value"
    SetAttribute      name: property, forceRender: true
    Pop               inBlock: false
    Local             name: toto
    Attribute         name: property
