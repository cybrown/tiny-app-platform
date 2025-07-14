main()
  entry:
    Literal           true
    Literal           true
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    Literal           "ok"
    Jump              if_end_3
  if_false_2:
    Literal           true
    Literal           false
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_4
    Jump              if_false_5
  if_true_4:
    Literal           "ko"
    Jump              if_end_6
  if_false_5:
    Literal           "default"
    Jump              if_end_6
  if_end_6:
    Jump              if_end_3
  if_end_3:
