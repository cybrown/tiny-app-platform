main()
  entry:
    FunctionRef       name: oneLinerTry_0
    DeclareLocal      name: oneLinerTry, mutable: false, hasInitialValue: true
oneLinerTry_0()
  entry:
    Try               catchLabel: try_catch_1, endTryLabel: try_end_2
    Literal 0
    MakeArray
    Literal "arg"
    Local             name: arg1
    Literal 1
    MakeRecord
    Local             name: some_function_that_throws
    Call
    TryPop
    Jump              label: try_end_2
  try_catch_1:
    ScopeEnter
    PushLatestError
    DeclareLocal      mutable: false, name: err, hasInitialValue: true
    Pop               inBlock: false
    Local             name: error
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: log
    Call
    ScopeLeave        inBlock: false
    Jump              label: try_end_2
  try_end_2:
    MakeArrayForBlock count: 1
