main()
  entry:
    Literal           "a"
    Literal           "b"
    Literal           2
    MakeArray
    Pop               inBlock: false
    ScopeEnter
    Literal           42
    ScopeLeave        inBlock: false, count: 1
    Pop               inBlock: false
    FunctionRef       name: comment_1_0
    DeclareLocal      name: comment_1, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: comment_2_1
    DeclareLocal      name: comment_2, mutable: false, hasInitialValue: true
comment_1_0()
  entry:
    MakeArrayForBlock count: 0
comment_2_1()
  entry:
    Literal           40
    Literal           2
    Intrinsic         INTRINSIC_ADD
    MakeArrayForBlock count: 1
