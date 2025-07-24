main()
  entry:
    FunctionRef       name: map_0
    DeclareLocal      name: map, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: filter_1
    DeclareLocal      name: filter, mutable: false, hasInitialValue: true
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
    FunctionRef       name: func_3
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             filter
    Call
map_0(arr, mapper)
  entry:
    DeclareLocal      name: a, mutable: false, hasInitialValue: false
    Pop               inBlock: false
    Local             a
    MakeArrayForBlock count: 2
filter_1(arr, predicate)
  entry:
    DeclareLocal      name: a, mutable: false, hasInitialValue: false
    Pop               inBlock: false
    Local             a
    MakeArrayForBlock count: 2
func_2(in)
  entry:
    Local             in
    Literal           1
    Intrinsic         INTRINSIC_ADD
func_3(in)
  entry:
    Local             in
    Literal           2
    Intrinsic         INTRINSIC_GREATER
