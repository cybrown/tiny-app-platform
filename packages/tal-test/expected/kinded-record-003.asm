main()
  entry:
    FunctionRef       name: func_0
func_0()
  entry:
    Local             View
    Local             Text
    FunctionRef       name: func_1
    Literal           2
    MakeArray
    Literal           "boolPropTrue1"
    Literal           true
    Literal           "boolPropTrue2"
    Literal           true
    Literal           "boolPropFalse"
    Literal           false
    Literal           "propA"
    Literal           "a"
    Literal           "propAAA"
    Literal           "aaa"
    Literal           5
    MakeRecord
    Kinded
func_1()
  entry:
    Local             View
    Literal           0
    MakeArray
    Literal           "boolPropFalse"
    Literal           false
    Literal           1
    MakeRecord
    Kinded
