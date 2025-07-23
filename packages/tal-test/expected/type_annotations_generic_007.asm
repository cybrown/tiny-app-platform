main()
  entry:
    FunctionRef       name: string_to_number_0
    DeclareLocal      name: string_to_number, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: array_map_1
    DeclareLocal      name: array_map, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "hello"
    Literal           1
    MakeArray
    FunctionRef       name: func_2
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_map
    Call
string_to_number_0(str)
  entry:
    Literal           3
    MakeArrayForBlock count: 1
array_map_1(arr, b)
  entry:
    Literal           0
    Local             arr
    Index
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             b
    Call
    Literal           1
    MakeArray
    MakeArrayForBlock count: 1
func_2(arg)
  entry:
    Local             arg
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             string_to_number
    Call
