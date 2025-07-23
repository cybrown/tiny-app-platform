main()
  entry:
    FunctionRef       name: map_0
    DeclareLocal      name: map, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: number_to_string_1
    DeclareLocal      name: number_to_string, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           "value"
    Literal           true
    Literal           1
    MakeArray
    Literal           "mapper"
    FunctionRef       name: func_2
    Literal           2
    MakeRecord
    Local             map
    Call
map_0(value, mapper)
  entry:
    Literal           0
    Local             value
    Index
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             mapper
    Call
    Literal           1
    MakeArray
    MakeArrayForBlock count: 1
number_to_string_1(num)
  entry:
    Literal           ""
    MakeArrayForBlock count: 1
func_2(item)
  entry:
    Literal           "Plus 1: "
    Local             item
    Literal           1
    Intrinsic         INTRINSIC_ADD
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             number_to_string
    Call
    Intrinsic         INTRINSIC_ADD
