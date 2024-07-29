main()
  entry:
    Local             name: state
    Attribute         name: name
    Literal "list"
    Intrinsic         operation: INTRINSIC_EQUAL_STRICT
    JumpTrue          label: if_true_1
    Jump              label: if_false_2
  if_true_1:
    FunctionRef       name: func_0
    Jump              label: if_end_3
  if_false_2:
    Local             name: state
    Attribute         name: name
    Literal "editor"
    Intrinsic         operation: INTRINSIC_EQUAL_STRICT
    JumpTrue          label: if_true_4
    Jump              label: if_false_5
  if_true_4:
    FunctionRef       name: func_1
    Jump              label: if_end_6
  if_false_5:
    Local             name: state
    Attribute         name: name
    Literal "contact"
    Intrinsic         operation: INTRINSIC_EQUAL_STRICT
    JumpTrue          label: if_true_7
    Jump              label: if_false_8
  if_true_7:
    FunctionRef       name: func_2
    Jump              label: if_end_9
  if_false_8:
    FunctionRef       name: func_3
    Jump              label: if_end_9
  if_end_9:
    Jump              label: if_end_6
  if_end_6:
    Jump              label: if_end_3
  if_end_3:
func_0()
  entry:
    Local             name: List
    Literal 0
    MakeArray
    Literal "propA"
    Literal "value A"
    Literal "propB"
    Literal "value B"
    Literal "propC"
    Literal "value C"
    Literal "propD"
    Literal "value D"
    Literal 4
    MakeRecord
    Kinded
func_1()
  entry:
    Local             name: Editor
    Literal 0
    MakeArray
    Literal 0
    MakeRecord
    Kinded
func_2()
  entry:
    Local             name: Contact
    Literal 0
    MakeArray
    Literal 0
    MakeRecord
    Kinded
func_3()
  entry:
    Local             name: NotFound
    Literal 0
    MakeArray
    Literal 0
    MakeRecord
    Kinded
