main()
  entry:
    FunctionRef       name: map_0
    DeclareLocal      name: map, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_1
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             map
    Call
    Pop               inBlock: false
    FunctionRef       name: map_deep_2
    DeclareLocal      name: map_deep, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "a"
    FunctionRef       name: func_3
    Literal           1
    MakeRecord
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             map_deep
    Call
    Pop               inBlock: false
    FunctionRef       name: map_deep2_4
    DeclareLocal      name: map_deep2, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "a"
    FunctionRef       name: func_5
    Literal           "b"
    FunctionRef       name: func_6
    Literal           2
    MakeRecord
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             map_deep2
    Call
map_0(arg)
  entry:
    Literal           null
    MakeArrayForBlock count: 1
func_1(val)
  entry:
    Literal           null
map_deep_2(arg)
  entry:
    Literal           null
    MakeArrayForBlock count: 1
func_3(val)
  entry:
    Literal           null
map_deep2_4(arg)
  entry:
    Literal           null
    MakeArrayForBlock count: 1
func_5(val)
  entry:
    Literal           null
func_6(val2)
  entry:
    Literal           null
