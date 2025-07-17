main()
  entry:
    Pop               inBlock: false
    Literal           4
    DeclareLocal      name: a, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             a
    DeclareLocal      name: b, mutable: false, hasInitialValue: true
