main()
  entry:
    Local             a
    Literal           1
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    Literal           "ok1"
    Jump              if_end_3
  if_false_2:
    Local             a
    Literal           2
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_4
    Jump              if_false_5
  if_true_4:
    Literal           "ok2-1"
    Jump              if_end_6
  if_false_5:
    Local             a
    Literal           3
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_7
    Jump              if_false_8
  if_true_7:
    Literal           "ok3"
    Jump              if_end_9
  if_false_8:
    Literal           "ko2"
    Jump              if_end_9
  if_end_9:
    Jump              if_end_6
  if_end_6:
    Jump              if_end_3
  if_end_3:
