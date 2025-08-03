main()
  entry:
    Pop               inBlock: false
    Literal           "name"
    Literal           "toto"
    Literal           "age"
    Literal           32
    Literal           2
    MakeRecord
    DeclareLocal      name: a1, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           "name"
    Literal           "toto"
    Literal           1
    MakeRecord
    DeclareLocal      name: a2, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: a3_0
    DeclareLocal      name: a3, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: a4_1
    DeclareLocal      name: a4, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: a5_2
    DeclareLocal      name: a5, mutable: true, hasInitialValue: true
a3_0(row)
  entry:
    Literal           null
a4_1(row)
  entry:
    Literal           null
a5_2(row)
  entry:
    Literal           null
