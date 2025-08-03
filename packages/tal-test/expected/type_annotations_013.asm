main()
  entry:
    FunctionRef       name: a_0
    DeclareLocal      name: a, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: b_1
    DeclareLocal      name: b, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: c_2
    DeclareLocal      name: c, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             b
    Local             c
    Literal           2
    MakeArray
    DeclareLocal      name: d, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             a
    DeclareLocal      name: a2, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           0
    Local             d
    Index
    SetLocal          name: a2
a_0(row)
  entry:
    Literal           null
b_1(row)
  entry:
    Literal           null
c_2(row)
  entry:
    Literal           null
