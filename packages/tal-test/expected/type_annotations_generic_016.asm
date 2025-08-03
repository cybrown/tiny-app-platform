main()
  entry:
    FunctionRef       name: toto1_0
    DeclareLocal      name: toto1, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           "data"
    Literal           "name"
    Literal           "ok"
    Literal           "age"
    Literal           3
    Literal           2
    MakeRecord
    Literal           1
    MakeArray
    Literal           "columns"
    FunctionRef       name: func_1
    FunctionRef       name: func_2
    Literal           2
    MakeArray
    Literal           2
    MakeRecord
    Local             toto1
    Call
    Pop               inBlock: false
    FunctionRef       name: toto2_3
    DeclareLocal      name: toto2, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           "data"
    Literal           "name"
    Literal           "ok"
    Literal           1
    MakeRecord
    Literal           1
    MakeArray
    Literal           "columns"
    FunctionRef       name: func_4
    Literal           1
    MakeArray
    Literal           2
    MakeRecord
    Local             toto2
    Call
toto1_0(columns, data)
  entry:
    Literal           0
    MakeRecord
func_1(row)
  entry:
    Literal           null
func_2(row)
  entry:
    Literal           null
toto2_3(columns, data)
  entry:
    Literal           0
    MakeRecord
func_4(row)
  entry:
    Literal           null
