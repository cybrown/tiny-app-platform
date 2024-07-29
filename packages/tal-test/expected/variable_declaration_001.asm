main()
  entry:
    Literal "a1"
    DeclareLocal      name: a, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal "b1"
    SetLocal          name: b
    Pop               inBlock: false
    Literal "c1"
    DeclareLocal      name: c, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Local             name: a
    Pop               inBlock: false
    Local             name: b
    Pop               inBlock: false
    Local             name: c
    Pop               inBlock: false
    Literal "a2"
    DeclareLocal      name: a, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Literal "b2"
    SetLocal          name: b
    Pop               inBlock: false
    Literal "c2"
    DeclareLocal      name: c, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Local             name: a
    Pop               inBlock: false
    Local             name: b
    Pop               inBlock: false
    Local             name: c
    Pop               inBlock: false
    Literal "a3"
    SetLocal          name: a
    Pop               inBlock: false
    Literal "b3"
    SetLocal          name: b
    Pop               inBlock: false
    Literal "c3"
    SetLocal          name: c
    Pop               inBlock: false
    Local             name: a
    Pop               inBlock: false
    Local             name: b
    Pop               inBlock: false
    Local             name: c
