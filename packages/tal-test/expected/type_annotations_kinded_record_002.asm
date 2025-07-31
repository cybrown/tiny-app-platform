main()
  entry:
    FunctionRef       name: Debug_0
    DeclareLocal      name: Debug, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_1
Debug_0(value)
  entry:
    Literal           0
    MakeRecord
func_1()
  entry:
    Local             Debug
    Literal           0
    MakeArray
    Literal           "value"
    Local             a
    Literal           1
    MakeRecord
    Kinded
