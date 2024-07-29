main()
  entry:
    Literal "1"
    DeclareLocal      name: a, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    ScopeEnter
    Literal "2"
    DeclareLocal      name: a, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: a
    ScopeLeave        inBlock: false, count: 2
    Pop               inBlock: false
    Local             name: a
