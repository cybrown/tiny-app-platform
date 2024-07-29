main()
  entry:
    Import            path: toto
    DeclareLocal      name: toto, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Local             toto
    Attribute         name: useExportedFunction
    Call
