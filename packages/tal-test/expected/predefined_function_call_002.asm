main()
  entry:
    Literal 0
    MakeArray
    Literal 0
    MakeRecord
    Local             name: give_hello
    Call
    Literal " Toto"
    Intrinsic         operation: INTRINSIC_ADD
