main()
  entry:
    FunctionRef       name: add_0
    DeclareLocal      name: add, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal "add"
    Local             name: add
    Literal 1
    MakeRecord
add_0([object Object], [object Object])
  entry:
    Local             name: a
    Local             name: b
    Intrinsic         operation: INTRINSIC_ADD
    MakeArrayForBlock count: 1
