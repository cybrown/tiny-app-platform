main()
  entry:
    Import            path: ./test-sources/module-definition-001.tas
    DeclareLocal      name: mylib, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal 40
    Literal 2
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: mylib
    Attribute         name: add
    Call
