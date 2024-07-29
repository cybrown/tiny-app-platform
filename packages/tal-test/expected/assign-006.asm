main()
  entry:
    DeclareLocal      name: toto, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    Literal           "value"
    SetLocal          name: toto
    Pop               inBlock: false
    Local             toto
