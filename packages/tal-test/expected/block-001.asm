main()
  entry:
    ScopeEnter
    Literal           "value1"
    Pop               inBlock: false
    Literal           "value2"
    Pop               inBlock: false
    Literal           13
    ScopeLeave        inBlock: false, count: 3
