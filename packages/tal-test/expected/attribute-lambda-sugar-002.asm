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
    FunctionRef       name: func_0
    Call
func_0($$arg$$)
  entry:
    Local             $$arg$$
    Attribute         name: toto
