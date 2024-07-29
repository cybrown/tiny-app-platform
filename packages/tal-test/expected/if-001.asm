main()
  entry:
    Local             name: a
    Literal 3
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_1
    Jump              label: if_false_2
  if_true_1:
    ScopeEnter
    Literal "ok"
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_3
  if_false_2:
    Literal null
    Jump              label: if_end_3
  if_end_3:
    Pop               inBlock: false
    Local             name: a
    Literal 3
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_4
    Jump              label: if_false_5
  if_true_4:
    ScopeEnter
    Literal "ok1"
    Pop               inBlock: false
    Literal "ok2"
    ScopeLeave        inBlock: false, count: 2
    Jump              label: if_end_6
  if_false_5:
    Literal null
    Jump              label: if_end_6
  if_end_6:
    Pop               inBlock: false
    Local             name: a
    Literal 3
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_7
    Jump              label: if_false_8
  if_true_7:
    ScopeEnter
    Literal "ok"
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_9
  if_false_8:
    ScopeEnter
    Literal "ko"
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_9
  if_end_9:
    Pop               inBlock: false
    Local             name: a
    Literal 3
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_10
    Jump              label: if_false_11
  if_true_10:
    ScopeEnter
    Literal "ok1"
    Pop               inBlock: false
    Literal "ok2"
    ScopeLeave        inBlock: false, count: 2
    Jump              label: if_end_12
  if_false_11:
    ScopeEnter
    Literal "ko1"
    Pop               inBlock: false
    Literal "ko2"
    ScopeLeave        inBlock: false, count: 2
    Jump              label: if_end_12
  if_end_12:
    Pop               inBlock: false
    Local             name: a
    Literal 3
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_13
    Jump              label: if_false_14
  if_true_13:
    ScopeEnter
    Literal "ok"
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_15
  if_false_14:
    Literal null
    Jump              label: if_end_15
  if_end_15:
    Pop               inBlock: false
    Local             name: toto
