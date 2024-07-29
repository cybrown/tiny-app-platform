main()
  entry:
    FunctionRef       name: func_0
    Pop               inBlock: false
    FunctionRef       name: func_1
    Pop               inBlock: false
    FunctionRef       name: func_2
func_0(a)
  entry:
    Local             a
    Local             b
    Intrinsic         INTRINSIC_ADD
func_1(a)
  entry:
    Local             a
    Local             b
    Intrinsic         INTRINSIC_ADD
func_2(a)
  entry:
    FunctionRef       name: func_3
func_3(b)
  entry:
    Local             a
    Local             b
    Intrinsic         INTRINSIC_ADD
