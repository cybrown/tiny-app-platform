main()
  entry:
    FunctionRef       name: run_0
    DeclareLocal      name: run, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           8
    FunctionRef       name: func_1
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             run
    Call
run_0(n, f)
  entry:
    Literal           0
    MakeArray
    Literal           "value"
    Local             n
    Literal           "index"
    Literal           0
    Literal           2
    MakeRecord
    Local             f
    Call
    MakeArrayForBlock count: 1
func_1(value)
  entry:
    Literal           true
