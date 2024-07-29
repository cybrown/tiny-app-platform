main()
  entry:
    Literal 1
    DeclareLocal      name: a, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal 1
    DeclareLocal      name: b, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal false
    JumpTrue          label: if_true_1
    Jump              label: if_false_2
  if_true_1:
    ScopeEnter
    Literal 2
    SetLocal          name: a
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_3
  if_false_2:
    Literal null
    Jump              label: if_end_3
  if_end_3:
    Pop               inBlock: false
    Local             name: a
    Pop               inBlock: false
    Local             name: b
