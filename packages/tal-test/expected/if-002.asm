main()
  entry:
    Local             name: a
    Literal 1
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_1
    Jump              label: if_false_2
  if_true_1:
    ScopeEnter
    Literal "ok1"
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_3
  if_false_2:
    Local             name: a
    Literal 2
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_4
    Jump              label: if_false_5
  if_true_4:
    ScopeEnter
    Literal "ok2-1"
    Pop               inBlock: false
    Literal "ok2-2"
    ScopeLeave        inBlock: false, count: 2
    Jump              label: if_end_6
  if_false_5:
    Local             name: a
    Literal 3
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_7
    Jump              label: if_false_8
  if_true_7:
    ScopeEnter
    Literal "ok3"
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_9
  if_false_8:
    ScopeEnter
    Literal "ko2"
    Pop               inBlock: false
    Literal "ko2"
    ScopeLeave        inBlock: false, count: 2
    Jump              label: if_end_9
  if_end_9:
    Jump              label: if_end_6
  if_end_6:
    Jump              label: if_end_3
  if_end_3:
