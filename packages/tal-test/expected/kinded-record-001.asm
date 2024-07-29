main()
  entry:
    FunctionRef       name: func_0
    Pop               inBlock: false
    FunctionRef       name: func_1
    Pop               inBlock: false
    FunctionRef       name: func_2
func_0()
  entry:
    Local             name: App
    Literal 0
    MakeArray
    Literal "hello"
    Literal "world"
    Literal 1
    MakeRecord
    Kinded
func_1()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "text"
    Literal "Hello, World !"
    Literal 1
    MakeRecord
    Kinded
func_2()
  entry:
    Local             name: View
    FunctionRef       name: func_3
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Kinded
func_3()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "text"
    Literal "Hello, World ! 2"
    Literal 1
    MakeRecord
    Kinded
