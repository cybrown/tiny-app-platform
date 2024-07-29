main()
  entry:
    Literal 0
    MakeArray
    DeclareLocal      name: toto, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal 3
    DeclareLocal      name: index, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: index
    Local             name: toto
    Literal "value"
    SetIndex          forceRender: true
    Pop               inBlock: false
    Literal 3
    Local             name: toto
    Index
