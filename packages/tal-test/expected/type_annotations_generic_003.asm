main()
  entry:
    FunctionRef       name: number_to_string_0
    DeclareLocal      name: number_to_string, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: map_1
    DeclareLocal      name: map, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           1
    Literal           2
    Literal           3
    Literal           3
    MakeArray
    FunctionRef       name: func_2
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             map
    Call
    DeclareLocal      name: finalArray, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             finalArray
number_to_string_0(num)
  entry:
    Literal           "str"
    MakeArrayForBlock count: 1
map_1(arr, mapper)
  entry:
    DeclareLocal      name: a, mutable: false, hasInitialValue: false
    Pop               inBlock: false
    Local             a
    MakeArrayForBlock count: 2
func_2(num)
  entry:
    Local             num
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             number_to_string
    Call
