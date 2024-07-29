main()
  entry:
    Literal           "token"
    DeclareLocal      name: TOKEN, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: t_0
    DeclareLocal      name: t, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: funcAsValue_2
    DeclareLocal      name: funcAsValue, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "TOKEN"
    Local             TOKEN
    Literal           "t"
    Local             t
    Literal           "funcAsValue"
    Local             funcAsValue
    Literal           3
    MakeRecord
t_0(text)
  entry:
    FunctionRef       name: func_1
    MakeArrayForBlock count: 1
func_1()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Local             text
    Literal           1
    MakeRecord
    Kinded
funcAsValue_2()
  entry:
    Literal           null
