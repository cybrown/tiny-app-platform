main()
  entry:
    FunctionRef       name: letterToNumber_0
    DeclareLocal      name: letterToNumber, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal "a"
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: letterToNumber
    Call
    Pop               inBlock: false
    Literal "b"
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: letterToNumber
    Call
    Pop               inBlock: false
    Literal "c"
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: letterToNumber
    Call
    Pop               inBlock: false
    Literal "d"
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: letterToNumber
    Call
letterToNumber_0([object Object])
  entry:
    Local             name: letter
    Literal "a"
    Intrinsic         operation: INTRINSIC_EQUAL_STRICT
    JumpTrue          label: if_true_1
    Jump              label: if_false_2
  if_true_1:
    Literal 1
    Jump              label: if_end_3
  if_false_2:
    Local             name: letter
    Literal "b"
    Intrinsic         operation: INTRINSIC_EQUAL_STRICT
    JumpTrue          label: if_true_4
    Jump              label: if_false_5
  if_true_4:
    Literal 2
    Jump              label: if_end_6
  if_false_5:
    Local             name: letter
    Literal "c"
    Intrinsic         operation: INTRINSIC_EQUAL_STRICT
    JumpTrue          label: if_true_7
    Jump              label: if_false_8
  if_true_7:
    Literal 3
    Jump              label: if_end_9
  if_false_8:
    Literal null
    Jump              label: if_end_9
  if_end_9:
    Jump              label: if_end_6
  if_end_6:
    Jump              label: if_end_3
  if_end_3:
    MakeArrayForBlock count: 1
