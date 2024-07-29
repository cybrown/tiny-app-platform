main()
  entry:
    ScopeEnter
    Literal           2
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             tmp_left
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    Local             tmp_left
    Jump              if_end_3
  if_false_2:
    Literal           0
    Jump              if_end_3
  if_end_3:
    ScopeLeave        inBlock: false, count: 2
