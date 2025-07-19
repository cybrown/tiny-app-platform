main()
  entry:
    FunctionRef       name: map_0
    DeclareLocal      name: map, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: filter_1
    DeclareLocal      name: filter, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: reduce_2
    DeclareLocal      name: reduce, mutable: false, hasInitialValue: true
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
reduce_2(arr, reducer)
  entry:
    DeclareLocal      name: a, mutable: false, hasInitialValue: false
    Pop               inBlock: false
    Local             a
    MakeArrayForBlock count: 2
