main()
  entry:
    Literal "token"
    DeclareLocal      name: TOKEN, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: t_0
    DeclareLocal      name: t, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal "TOKEN"
    Local             name: TOKEN
    Literal "t"
    Local             name: t
    Literal 2
    MakeRecord
t_0([object Object])
  entry:
    FunctionRef       name: func_1
    MakeArrayForBlock count: 1
func_1()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "text"
    Local             name: text
    Literal 1
    MakeRecord
    Kinded
