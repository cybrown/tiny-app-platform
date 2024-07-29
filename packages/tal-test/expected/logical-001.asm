main()
  entry:
    ScopeEnter
    Literal 2
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: tmp_left
    JumpTrue          label: if_true_1
    Jump              label: if_false_2
  if_true_1:
    Literal 0
    Jump              label: if_end_3
  if_false_2:
    Local             name: tmp_left
    Jump              label: if_end_3
  if_end_3:
    ScopeLeave        inBlock: false, count: 2
