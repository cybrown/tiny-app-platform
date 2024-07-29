main()
  entry:
    Local             state
    Attribute         name: name
    Literal           "list"
    Intrinsic         INTRINSIC_EQUAL_STRICT
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    FunctionRef       name: func_0
    Jump              if_end_3
  if_false_2:
    Local             state
    Attribute         name: name
    Literal           "editor"
    Intrinsic         INTRINSIC_EQUAL_STRICT
    JumpTrue          if_true_4
    Jump              if_false_5
  if_true_4:
    FunctionRef       name: func_1
    Jump              if_end_6
  if_false_5:
    Local             state
    Attribute         name: name
    Literal           "contact"
    Intrinsic         INTRINSIC_EQUAL_STRICT
    JumpTrue          if_true_7
    Jump              if_false_8
  if_true_7:
    FunctionRef       name: func_2
    Jump              if_end_9
  if_false_8:
    FunctionRef       name: func_3
    Jump              if_end_9
  if_end_9:
    Jump              if_end_6
  if_end_6:
    Jump              if_end_3
  if_end_3:
func_0()
  entry:
    Local             List
    Literal           0
    MakeArray
    Literal           "propA"
    Literal           "value A"
    Literal           "propB"
    Literal           "value B"
    Literal           "propC"
    Literal           "value C"
    Literal           "propD"
    Literal           "value D"
    Literal           4
    MakeRecord
    Kinded
func_1()
  entry:
    Local             Editor
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_2()
  entry:
    Local             Contact
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_3()
  entry:
    Local             NotFound
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
