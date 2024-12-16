main()
  entry:
    Try               catchLabel: try_catch_1, endTryLabel: try_end_2
    Local             missing_variable
    TryPop
    Jump              try_end_2
  try_catch_1:
    ScopeEnter
    ScopeEnter
    Local             error
    ScopeLeave        inBlock: false, count: 1
    ScopeLeave        inBlock: false
    Jump              try_end_2
  try_end_2:
