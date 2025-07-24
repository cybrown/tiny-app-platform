main()
  entry:
    FunctionRef       name: fact_0
    DeclareLocal      name: fact, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           5
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             fact
    Call
fact_0(value)
  entry:
    Local             value
    Literal           0
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    ScopeEnter
    Literal           0
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_3
  if_false_2:
    Local             value
    Literal           1
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_4
    Jump              if_false_5
  if_true_4:
    ScopeEnter
    Literal           1
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_6
  if_false_5:
    ScopeEnter
    Local             value
    Local             value
    Literal           1
    Intrinsic         INTRINSIC_SUBSTRACT
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             fact
    Call
    Intrinsic         INTRINSIC_MULTIPLY
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_6
  if_end_6:
    Jump              if_end_3
  if_end_3:
    MakeArrayForBlock count: 1
