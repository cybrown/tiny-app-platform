main()
  entry:
    FunctionRef       name: func_0
    Pop               inBlock: false
    FunctionRef       name: func_1
    Pop               inBlock: false
    FunctionRef       name: func_2
    Pop               inBlock: false
    Local             a
func_0()
  entry:
    Literal           42
func_1()
  entry:
    Local             a
    Local             b
    Intrinsic         INTRINSIC_ADD
func_2()
  entry:
    Literal           "A"
    Pop               inBlock: false
    Literal           42
    MakeArrayForBlock count: 2
