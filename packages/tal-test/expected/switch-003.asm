main()
  entry:
    Literal true
    Local             name: expr1
    Intrinsic         operation: INTRINSIC_EQUAL_STRICT
    JumpTrue          label: if_true_1
    Jump              label: if_false_2
  if_true_1:
    Local             name: value1
    Jump              label: if_end_3
  if_false_2:
    Literal true
    Local             name: expr2
    Intrinsic         operation: INTRINSIC_EQUAL_STRICT
    JumpTrue          label: if_true_4
    Jump              label: if_false_5
  if_true_4:
    Local             name: value2
    Jump              label: if_end_6
  if_false_5:
    Local             name: defaultValue
    Jump              label: if_end_6
  if_end_6:
    Jump              label: if_end_3
  if_end_3:
