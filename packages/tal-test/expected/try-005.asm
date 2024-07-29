main()
  entry:
    FunctionRef       name: toto1_0
    DeclareLocal      name: toto1, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: toto2_1
    DeclareLocal      name: toto2, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal 0
    MakeArray
    Literal 0
    MakeRecord
    Local             name: toto2
    Call
toto1_0()
  entry:
    Local             name: missing_variable
    MakeArrayForBlock count: 1
toto2_1()
  entry:
    Try               catchLabel: try_catch_1, endTryLabel: try_end_2
    ScopeEnter
    Literal 0
    MakeArray
    Literal 0
    MakeRecord
    Local             name: toto1
    Call
    ScopeLeave        inBlock: false, count: 1
    TryPop
    Jump              label: try_end_2
  try_catch_1:
    ScopeEnter
    PushLatestError
    DeclareLocal      mutable: false, name: err, hasInitialValue: true
    Pop               inBlock: false
    ScopeEnter
    Literal "value from toto2"
    ScopeLeave        inBlock: false, count: 1
    ScopeLeave        inBlock: false
    Jump              label: try_end_2
  try_end_2:
    MakeArrayForBlock count: 1
