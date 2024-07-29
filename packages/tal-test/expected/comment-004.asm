main()
  entry:
    Literal           "Hello, World !"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             print
    Call
    Pop               inBlock: false
    Literal           true
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    ScopeEnter
    Literal           true
    Pop               inBlock: false
    Literal           2
    ScopeLeave        inBlock: false, count: 2
    Jump              if_end_3
  if_false_2:
    ScopeEnter
    Literal           "false as a string"
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_3
  if_end_3:
    Pop               inBlock: false
    FunctionRef       name: add_0
    DeclareLocal      name: add, mutable: false, hasInitialValue: true
add_0(a, b)
  entry:
    Local             a
    Local             b
    Intrinsic         INTRINSIC_ADD
    MakeArrayForBlock count: 1
