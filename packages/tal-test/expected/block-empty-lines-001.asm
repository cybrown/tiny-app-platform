main()
  entry:
    ScopeEnter
    Literal           "a"
    Pop               inBlock: false
    Literal           "b"
    ScopeLeave        inBlock: false, count: 2
