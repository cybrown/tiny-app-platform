main()
  entry:
    Try               catchLabel: try_catch_1, endTryLabel: try_end_2
    ScopeEnter
    Local             missing_variable
    ScopeLeave        inBlock: false, count: 1
    TryPop
    Jump              try_end_2
  try_catch_1:
    ScopeEnter
    ScopeEnter
    Literal           "value on error"
    ScopeLeave        inBlock: false, count: 1
    ScopeLeave        inBlock: false
    Jump              try_end_2
  try_end_2:
