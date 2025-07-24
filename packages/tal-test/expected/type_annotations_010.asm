main()
  entry:
    DeclareLocal      name: localNull, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    DeclareLocal      name: numberOrNull, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    DeclareLocal      name: boolOrNull, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    Literal           3
    DeclareLocal      name: localNumber, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Local             localNull
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    Literal           0
    MakeRecord
    Jump              if_end_3
  if_false_2:
    Literal           null
    Jump              if_end_3
  if_end_3:
    Pop               inBlock: false
    Local             numberOrNull
    JumpTrue          if_true_4
    Jump              if_false_5
  if_true_4:
    Literal           0
    MakeRecord
    Jump              if_end_6
  if_false_5:
    Literal           null
    Jump              if_end_6
  if_end_6:
    Pop               inBlock: false
    Local             boolOrNull
    JumpTrue          if_true_7
    Jump              if_false_8
  if_true_7:
    Literal           0
    MakeRecord
    Jump              if_end_9
  if_false_8:
    Literal           null
    Jump              if_end_9
  if_end_9:
    Pop               inBlock: false
    Local             localNumber
    JumpTrue          if_true_10
    Jump              if_false_11
  if_true_10:
    Literal           0
    MakeRecord
    Jump              if_end_12
  if_false_11:
    Literal           null
    Jump              if_end_12
  if_end_12:
