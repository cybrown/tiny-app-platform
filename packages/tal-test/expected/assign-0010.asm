main()
  entry:
    Literal null
    Literal null
    Literal null
    Literal 0
    MakeRecord
    Literal 4
    MakeArray
    DeclareLocal      name: toto, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal 3
    DeclareLocal      name: index, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: index
    Local             name: toto
    Index
    Literal "value"
    SetAttribute      name: property, forceRender: true
    Pop               inBlock: false
    Literal 3
    Local             name: toto
    Index
    Attribute         name: property
