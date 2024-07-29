main()
  entry:
    Literal "a"
    Literal "b"
    Literal "c"
    Literal "d"
    Literal "e"
    Literal 5
    MakeArray
    Literal 0
    MakeRecord
    Local             name: predefined_function
    Call
    Pop               inBlock: false
    Literal "b"
    Literal "c"
    Literal "d"
    Literal "e"
    Literal 4
    MakeArray
    Literal "arg1"
    Literal "a"
    Literal 1
    MakeRecord
    Local             name: predefined_function
    Call
    Pop               inBlock: false
    Literal "c"
    Literal "d"
    Literal "e"
    Literal 3
    MakeArray
    Literal "arg1"
    Literal "a"
    Literal "arg2"
    Literal "b"
    Literal 2
    MakeRecord
    Local             name: predefined_function
    Call
    Pop               inBlock: false
    Literal "a"
    Literal "b"
    Literal "d"
    Literal 3
    MakeArray
    Literal "arg2"
    Literal "c"
    Literal "arg1"
    Literal "e"
    Literal 2
    MakeRecord
    Local             name: predefined_function
    Call
    Pop               inBlock: false
    Literal "a"
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: predefined_function
    Call
    Pop               inBlock: false
    Literal "b"
    Literal "d"
    Literal 2
    MakeArray
    Literal "arg1"
    Literal "a"
    Literal "arg1"
    Literal "c"
    Literal "arg1"
    Literal "e"
    Literal 3
    MakeRecord
    Local             name: predefined_function
    Call
