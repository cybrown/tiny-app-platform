main()
  entry:
    Literal           0
    MakeArray
    Literal           "boolArgTrue"
    Literal           true
    Literal           "boolArgFalse"
    Literal           false
    Literal           2
    MakeRecord
    Local             predefined_function
    Call
    Pop               inBlock: false
    Literal           "b"
    Literal           1
    MakeArray
    Literal           "arg1"
    Literal           "a"
    Literal           "boolArgTrue"
    Literal           true
    Literal           "boolArgFalse"
    Literal           false
    Literal           3
    MakeRecord
    Local             predefined_function
    Call
    Pop               inBlock: false
    Literal           1
    Literal           1
    MakeArray
    Literal           "boolArgFalse"
    Literal           false
    Literal           1
    MakeRecord
    Local             predefined_function
    Call
