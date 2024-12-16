main()
  entry:
    FunctionRef       name: toto1_0
    DeclareLocal      name: toto1, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: toto2_1
    DeclareLocal      name: toto2, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Local             toto2
    Call
toto1_0()
  entry:
    Local             missing_variable
    MakeArrayForBlock count: 1
toto2_1()
  entry:
    Try               catchLabel: try_catch_1, endTryLabel: try_end_2
    ScopeEnter
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Local             toto1
    Call
    ScopeLeave        inBlock: false, count: 1
    TryPop
    Jump              try_end_2
  try_catch_1:
    ScopeEnter
    Local             errorToCatch
    ScopeLeave        inBlock: false
    Jump              try_end_2
  try_end_2:
    Pop               inBlock: false
    ScopeEnter
    Literal           "value from toto2"
    ScopeLeave        inBlock: false, count: 1
    MakeArrayForBlock count: 2
