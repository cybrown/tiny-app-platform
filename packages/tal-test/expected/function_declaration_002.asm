main()
  entry:
    Literal           1
    DeclareLocal      name: a, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           2
    DeclareLocal      name: b, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: f_0
    DeclareLocal      name: f, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal           1
    Literal           2
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           "a"
    Literal           5
    Literal           "b"
    Literal           6
    Literal           2
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           "b"
    Literal           7
    Literal           "a"
    Literal           8
    Literal           2
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           4
    Literal           1
    MakeArray
    Literal           "a"
    Literal           3
    Literal           1
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           6
    Literal           1
    MakeArray
    Literal           "b"
    Literal           5
    Literal           1
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           7
    Literal           1
    MakeArray
    Literal           "a"
    Literal           8
    Literal           1
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           9
    Literal           1
    MakeArray
    Literal           "b"
    Literal           0
    Literal           1
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           1
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           "a"
    Literal           2
    Literal           1
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           "b"
    Literal           3
    Literal           1
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           1
    Literal           1
    MakeArray
    Literal           "c"
    Literal           4
    Literal           1
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           "c"
    Literal           5
    Literal           "a"
    Literal           2
    Literal           2
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           0
    MakeArray
    Literal           "c"
    Literal           6
    Literal           "b"
    Literal           3
    Literal           2
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           1
    Literal           1
    MakeArray
    Literal           "b"
    Literal           2
    Literal           1
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           3
    Literal           1
    MakeArray
    Literal           "a"
    Literal           4
    Literal           1
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           5
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           6
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             f
    Call
    Pop               inBlock: false
    Literal           7
    Literal           1
    MakeArray
    Literal           "a"
    Literal           3
    Literal           1
    MakeRecord
    FunctionRef       name: func_1
    Call
    Pop               inBlock: false
    Literal           8
    Literal           1
    MakeArray
    Literal           "b"
    Literal           4
    Literal           1
    MakeRecord
    FunctionRef       name: func_2
    Call
f_0(a, b)
  entry:
    Literal           "a"
    Local             a
    Literal           "b"
    Local             b
    Literal           2
    MakeRecord
func_1(a, b)
  entry:
    Literal           "a"
    Local             a
    Literal           "b"
    Local             b
    Literal           2
    MakeRecord
func_2(a, b)
  entry:
    Literal           "a"
    Local             a
    Literal           "b"
    Local             b
    Literal           2
    MakeRecord
