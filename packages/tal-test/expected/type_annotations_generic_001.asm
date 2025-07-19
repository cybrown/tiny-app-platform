main()
  entry:
    FunctionRef       name: myGenericFunc0_0
    DeclareLocal      name: myGenericFunc0, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: myGenericFunc1_1
    DeclareLocal      name: myGenericFunc1, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: myGenericFunc2_2
    DeclareLocal      name: myGenericFunc2, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: myGenericFunc3_3
    DeclareLocal      name: myGenericFunc3, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: myGenericFunc4_4
    DeclareLocal      name: myGenericFunc4, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: myGenericFunc5_5
    DeclareLocal      name: myGenericFunc5, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: myGenericFunc6_6
    DeclareLocal      name: myGenericFunc6, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: myGenericFunc7_7
    DeclareLocal      name: myGenericFunc7, mutable: false, hasInitialValue: true
myGenericFunc0_0(param)
  entry:
    Literal           1
    MakeArrayForBlock count: 1
myGenericFunc1_1(param)
  entry:
    Literal           2
    MakeArrayForBlock count: 1
myGenericFunc2_2(param)
  entry:
    Literal           3
    MakeArrayForBlock count: 1
myGenericFunc3_3(param)
  entry:
    Literal           null
    MakeArrayForBlock count: 1
myGenericFunc4_4(param)
  entry:
    Local             param
    MakeArrayForBlock count: 1
myGenericFunc5_5(param)
  entry:
    Literal           null
    MakeArrayForBlock count: 1
myGenericFunc6_6(param)
  entry:
    Local             param
    MakeArrayForBlock count: 1
myGenericFunc7_7(param)
  entry:
    Local             param
    MakeArrayForBlock count: 1
