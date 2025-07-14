main()
  entry:
    Literal           1
    Literal           2
    Intrinsic         INTRINSIC_ADD
    Pop               inBlock: false
    Literal           2
    Literal           1
    Intrinsic         INTRINSIC_SUBSTRACT
    Pop               inBlock: false
    Literal           2
    Literal           6
    Intrinsic         INTRINSIC_MULTIPLY
    Pop               inBlock: false
    Literal           60
    Literal           3
    Intrinsic         INTRINSIC_DIVIDE
    Pop               inBlock: false
    Literal           51
    Literal           10
    Intrinsic         INTRINSIC_MODULO
    Pop               inBlock: false
    Literal           1
    Literal           2
    Intrinsic         INTRINSIC_LESSER
    Pop               inBlock: false
    Literal           1
    Literal           2
    Intrinsic         INTRINSIC_LESSER_OR_EQUAL
    Pop               inBlock: false
    Literal           1
    Literal           2
    Intrinsic         INTRINSIC_GREATER
    Pop               inBlock: false
    Literal           1
    Literal           2
    Intrinsic         INTRINSIC_GREATER_OR_EQUAL
    Pop               inBlock: false
    Literal           1
    Literal           2
    Intrinsic         INTRINSIC_EQUAL
    Pop               inBlock: false
    Literal           1
    Literal           2
    Intrinsic         INTRINSIC_NOT_EQUAL
    Pop               inBlock: false
    ScopeEnter
    Literal           3
    Intrinsic         INTRINSIC_POSITIF
    ScopeLeave        inBlock: false, count: 1
    Pop               inBlock: false
    Literal           true
    Intrinsic         INTRINSIC_NOT
    Pop               inBlock: false
    ScopeEnter
    Literal           2
    Intrinsic         INTRINSIC_NEGATE
    ScopeLeave        inBlock: false, count: 1
    Pop               inBlock: false
    Literal           "1"
    Literal           1
    Intrinsic         INTRINSIC_EQUAL
    Pop               inBlock: false
    Literal           "1"
    Literal           1
    Intrinsic         INTRINSIC_NOT_EQUAL
