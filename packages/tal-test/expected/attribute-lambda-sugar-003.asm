main()
  entry:
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Local             get_record
    Call
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Literal           "parent"
    Literal           1
    FunctionRef       name: func_0
    Index
    Index
    Attribute         name: name
    Call
func_0($$arg$$)
  entry:
    Local             $$arg$$
    Attribute         name: people
