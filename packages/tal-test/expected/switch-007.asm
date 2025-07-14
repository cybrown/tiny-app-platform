main()
  entry:
    FunctionRef       name: letterToNumber_0
    DeclareLocal      name: letterToNumber, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "a"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             letterToNumber
    Call
    Pop               inBlock: false
    Literal           "b"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             letterToNumber
    Call
    Pop               inBlock: false
    Literal           "c"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             letterToNumber
    Call
    Pop               inBlock: false
    Literal           "d"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             letterToNumber
    Call
letterToNumber_0(letter)
  entry:
    Local             letter
    Literal           "a"
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    Literal           1
    Jump              if_end_3
  if_false_2:
    Local             letter
    Literal           "b"
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_4
    Jump              if_false_5
  if_true_4:
    Literal           2
    Jump              if_end_6
  if_false_5:
    Local             letter
    Literal           "c"
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_7
    Jump              if_false_8
  if_true_7:
    Literal           3
    Jump              if_end_9
  if_false_8:
    Literal           null
    Jump              if_end_9
  if_end_9:
    Jump              if_end_6
  if_end_6:
    Jump              if_end_3
  if_end_3:
    MakeArrayForBlock count: 1
