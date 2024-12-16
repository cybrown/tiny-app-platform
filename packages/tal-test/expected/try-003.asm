main()
  entry:
    FunctionRef       name: oneLinerTry_0
    DeclareLocal      name: oneLinerTry, mutable: false, hasInitialValue: true
oneLinerTry_0()
  entry:
    Try               catchLabel: try_catch_1, endTryLabel: try_end_2
    Literal           0
    MakeArray
    Literal           "arg"
    Local             arg1
    Literal           1
    MakeRecord
    Local             some_function_that_throws
    Call
    TryPop
    Jump              try_end_2
  try_catch_1:
    ScopeEnter
    Local             error
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             log
    Call
    ScopeLeave        inBlock: false
    Jump              try_end_2
  try_end_2:
    MakeArrayForBlock count: 1
