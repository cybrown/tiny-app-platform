main()
  entry:
    FunctionRef       name: map_0
    DeclareLocal      name: map, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "hello"
    Literal           1
    MakeArray
    FunctionRef       name: func_1
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             map
    Call
map_0(arr, b)
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
    MakeArrayForBlock count: 1
func_1(arg)
  entry:
    Literal           3
