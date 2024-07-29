main()
  entry:
    Literal           1
    DeclareLocal      name: a, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           1
    DeclareLocal      name: b, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           true
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    ScopeEnter
    Literal           2
    SetLocal          name: a
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_3
  if_false_2:
    ScopeEnter
    Literal           2
    SetLocal          name: b
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_3
  if_end_3:
    Pop               inBlock: false
    Local             a
    Pop               inBlock: false
    Local             b
