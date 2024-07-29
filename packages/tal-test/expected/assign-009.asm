main()
  entry:
    Literal "property"
    Literal 0
    MakeArray
    Literal 1
    MakeRecord
    DeclareLocal      name: toto, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal 3
    DeclareLocal      name: index, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: index
    Local             name: toto
    Attribute         name: property
    Literal "value"
    SetIndex          forceRender: true
    Pop               inBlock: false
    Literal 3
    Local             name: toto
    Attribute         name: property
    Index
