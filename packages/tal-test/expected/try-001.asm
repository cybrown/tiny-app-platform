main()
  entry:
    Try               catchLabel: try_catch_1, endTryLabel: try_end_2
    ScopeEnter
    Local             name: missing_variable
    ScopeLeave        inBlock: false, count: 1
    TryPop
    Jump              label: try_end_2
  try_catch_1:
    ScopeEnter
    PushLatestError
    DeclareLocal      mutable: false, name: err, hasInitialValue: true
    Pop               inBlock: false
    ScopeEnter
    Local             name: error
    ScopeLeave        inBlock: false, count: 1
    ScopeLeave        inBlock: false
    Jump              label: try_end_2
  try_end_2:
