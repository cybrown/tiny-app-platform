main()
  entry:
    Literal           true
    Local             expr1
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    Local             value1
    Jump              if_end_3
  if_false_2:
    Literal           true
    Local             expr2
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_4
    Jump              if_false_5
  if_true_4:
    Local             value2
    Jump              if_end_6
  if_false_5:
    Local             defaultValue
    Jump              if_end_6
  if_end_6:
    Jump              if_end_3
  if_end_3:
