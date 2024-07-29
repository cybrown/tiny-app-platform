main()
  entry:
    Literal           0
    DeclareLocal      name: i, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           null
    Jump              while_condition_1
  while_condition_1:
    Local             i
    Literal           10
    Intrinsic         INTRINSIC_LESSER
    JumpTrue          while_body_2
    Jump              while_end_3
  while_body_2:
    Pop               inBlock: false
    ScopeEnter
    Local             i
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             log
    Call
    Pop               inBlock: false
    Local             i
    Literal           1
    Intrinsic         INTRINSIC_ADD
    SetLocal          name: i
    ScopeLeave        inBlock: false, count: 2
    Jump              while_condition_1
  while_end_3:
