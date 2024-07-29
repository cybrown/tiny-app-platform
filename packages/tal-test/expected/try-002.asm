main()
  entry:
    Try               catchLabel: try_catch_1, endTryLabel: try_end_2
    Local             name: missing_variable
    TryPop
    Jump              label: try_end_2
  try_catch_1:
    ScopeEnter
    PushLatestError
    DeclareLocal      mutable: false, name: err, hasInitialValue: true
    Pop               inBlock: false
    Local             name: error
    ScopeLeave        inBlock: false
    Jump              label: try_end_2
  try_end_2:
