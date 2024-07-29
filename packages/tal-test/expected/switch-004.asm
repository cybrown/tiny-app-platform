main()
  entry:
    Literal true
    Literal true
    Intrinsic         operation: INTRINSIC_EQUAL_STRICT
    JumpTrue          label: if_true_1
    Jump              label: if_false_2
  if_true_1:
    Literal "ok"
    Jump              label: if_end_3
  if_false_2:
    Literal true
    Literal false
    Intrinsic         operation: INTRINSIC_EQUAL_STRICT
    JumpTrue          label: if_true_4
    Jump              label: if_false_5
  if_true_4:
    Literal "ko"
    Jump              label: if_end_6
  if_false_5:
    Literal "default"
    Jump              label: if_end_6
  if_end_6:
    Jump              label: if_end_3
  if_end_3:
