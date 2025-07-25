main()
  entry:
    FunctionRef       name: Title_0
    DeclareLocal      name: Title, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryText_2
    DeclareLocal      name: GalleryText, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryInputText_11
    DeclareLocal      name: GalleryInputText, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryCheckbox_20
    DeclareLocal      name: GalleryCheckbox, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryButton_37
    DeclareLocal      name: GalleryButton, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryLink_46
    DeclareLocal      name: GalleryLink, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryPager_4a
    DeclareLocal      name: GalleryPager, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GallerySelect_57
    DeclareLocal      name: GallerySelect, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryTable_6d
    DeclareLocal      name: GalleryTable, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryTabs_84
    DeclareLocal      name: GalleryTabs, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryLoader_90
    DeclareLocal      name: GalleryLoader, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryOverlay_a6
    DeclareLocal      name: GalleryOverlay, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GalleryErrorHandling_bd
    DeclareLocal      name: GalleryErrorHandling, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: GallerySnippet_c2
    DeclareLocal      name: GallerySnippet, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_c6
Title_0(text)
  entry:
    FunctionRef       name: func_1
    MakeArrayForBlock count: 1
func_1()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Local             text
    Literal           "align"
    Literal           "center"
    Literal           "weight"
    Literal           "light"
    Literal           "size"
    Literal           2
    Literal           4
    MakeRecord
    Kinded
GalleryText_2()
  entry:
    FunctionRef       name: func_3
    MakeArrayForBlock count: 1
func_3()
  entry:
    Local             Column
    FunctionRef       name: func_4
    FunctionRef       name: func_5
    FunctionRef       name: func_6
    FunctionRef       name: func_7
    FunctionRef       name: func_8
    FunctionRef       name: func_9
    FunctionRef       name: func_a
    FunctionRef       name: func_b
    FunctionRef       name: func_c
    FunctionRef       name: func_d
    FunctionRef       name: func_e
    FunctionRef       name: func_f
    Literal           12
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_4()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Text"
    Literal           1
    MakeRecord
    Kinded
func_5()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Simple text"
    Literal           1
    MakeRecord
    Kinded
func_6()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Underline"
    Literal           "line"
    Literal           "under"
    Literal           2
    MakeRecord
    Kinded
func_7()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Overline"
    Literal           "line"
    Literal           "over"
    Literal           2
    MakeRecord
    Kinded
func_8()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Strike through"
    Literal           "line"
    Literal           "through"
    Literal           2
    MakeRecord
    Kinded
func_9()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "A little bigger"
    Literal           "size"
    Literal           1.1
    Literal           2
    MakeRecord
    Kinded
func_a()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "And bold"
    Literal           "size"
    Literal           1.1
    Literal           "weight"
    Literal           "bold"
    Literal           3
    MakeRecord
    Kinded
func_b()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Bigger and light"
    Literal           "size"
    Literal           1.5
    Literal           "weight"
    Literal           "light"
    Literal           3
    MakeRecord
    Kinded
func_c()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "With a different color"
    Literal           "size"
    Literal           1.5
    Literal           "weight"
    Literal           "light"
    Literal           "color"
    Literal           "teal"
    Literal           4
    MakeRecord
    Kinded
func_d()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Centered !"
    Literal           "size"
    Literal           1.5
    Literal           "weight"
    Literal           "light"
    Literal           "color"
    Literal           "teal"
    Literal           "align"
    Literal           "center"
    Literal           "copy"
    Literal           true
    Literal           6
    MakeRecord
    Kinded
func_e()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Preformated !"
    Literal           "preformatted"
    Literal           true
    Literal           2
    MakeRecord
    Kinded
func_f()
  entry:
    Local             Row
    FunctionRef       name: func_10
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_10()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Preformated inside Row !"
    Literal           "preformatted"
    Literal           true
    Literal           2
    MakeRecord
    Kinded
GalleryInputText_11()
  entry:
    Literal           ""
    DeclareLocal      name: value, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_12
    MakeArrayForBlock count: 2
func_12()
  entry:
    Local             Column
    FunctionRef       name: func_13
    FunctionRef       name: func_14
    FunctionRef       name: func_16
    FunctionRef       name: func_18
    FunctionRef       name: func_1a
    FunctionRef       name: func_1c
    FunctionRef       name: func_1e
    Literal           7
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_13()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "InputText"
    Literal           1
    MakeRecord
    Kinded
func_14()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_15
    Literal           2
    MakeRecord
    Kinded
func_15(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_16()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "placeholder"
    Literal           "With placeholder"
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_17
    Literal           3
    MakeRecord
    Kinded
func_17(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_18()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "multiline"
    Literal           true
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_19
    Literal           3
    MakeRecord
    Kinded
func_19(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_1a()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "disabled"
    Literal           true
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_1b
    Literal           3
    MakeRecord
    Kinded
func_1b(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_1c()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "placeholder"
    Literal           "With placeholder"
    Literal           "disabled"
    Literal           true
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_1d
    Literal           4
    MakeRecord
    Kinded
func_1d(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_1e()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "multiline"
    Literal           true
    Literal           "disabled"
    Literal           true
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_1f
    Literal           4
    MakeRecord
    Kinded
func_1f(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
GalleryCheckbox_20()
  entry:
    Literal           false
    DeclareLocal      name: value, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_21
    MakeArrayForBlock count: 2
func_21()
  entry:
    Local             Column
    FunctionRef       name: func_22
    FunctionRef       name: func_23
    FunctionRef       name: func_28
    FunctionRef       name: func_2d
    FunctionRef       name: func_32
    Literal           5
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_22()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "CheckBox Switch"
    Literal           1
    MakeRecord
    Kinded
func_23()
  entry:
    Local             Row
    FunctionRef       name: func_24
    FunctionRef       name: func_26
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_24()
  entry:
    Local             CheckBox
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "primary"
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_25
    Literal           3
    MakeRecord
    Kinded
func_25(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_26()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "primary"
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_27
    Literal           3
    MakeRecord
    Kinded
func_27(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_28()
  entry:
    Local             Row
    FunctionRef       name: func_29
    FunctionRef       name: func_2b
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_29()
  entry:
    Local             CheckBox
    Literal           0
    MakeArray
    Literal           "disabled"
    Literal           true
    Literal           "label"
    Literal           "primary disabled"
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_2a
    Literal           4
    MakeRecord
    Kinded
func_2a(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_2b()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "disabled"
    Literal           true
    Literal           "label"
    Literal           "primary disabled"
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_2c
    Literal           4
    MakeRecord
    Kinded
func_2c(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_2d()
  entry:
    Local             Row
    FunctionRef       name: func_2e
    FunctionRef       name: func_30
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_2e()
  entry:
    Local             CheckBox
    Literal           0
    MakeArray
    Literal           "secondary"
    Literal           true
    Literal           "label"
    Literal           "secondary"
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_2f
    Literal           4
    MakeRecord
    Kinded
func_2f(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_30()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "secondary"
    Literal           true
    Literal           "label"
    Literal           "secondary"
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_31
    Literal           4
    MakeRecord
    Kinded
func_31(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_32()
  entry:
    Local             Row
    FunctionRef       name: func_33
    FunctionRef       name: func_35
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_33()
  entry:
    Local             CheckBox
    Literal           0
    MakeArray
    Literal           "disabled"
    Literal           true
    Literal           "secondary"
    Literal           true
    Literal           "label"
    Literal           "secondary disabled"
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_34
    Literal           5
    MakeRecord
    Kinded
func_34(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_35()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "disabled"
    Literal           true
    Literal           "secondary"
    Literal           true
    Literal           "label"
    Literal           "secondary disabled"
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_36
    Literal           5
    MakeRecord
    Kinded
func_36(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
GalleryButton_37()
  entry:
    Literal           false
    DeclareLocal      name: value, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: disabled, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_38
    MakeArrayForBlock count: 3
func_38()
  entry:
    Local             Column
    FunctionRef       name: func_39
    FunctionRef       name: func_3a
    FunctionRef       name: func_3c
    FunctionRef       name: func_3d
    FunctionRef       name: func_3f
    FunctionRef       name: func_40
    FunctionRef       name: func_41
    FunctionRef       name: func_42
    FunctionRef       name: func_44
    Literal           9
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_39()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Button"
    Literal           1
    MakeRecord
    Kinded
func_3a()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "Disabled"
    Literal           "value"
    Local             disabled
    Literal           "onChange"
    FunctionRef       name: func_3b
    Literal           3
    MakeRecord
    Kinded
func_3b(newValue)
  entry:
    Local             newValue
    SetLocal          name: disabled
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_3c()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Click me"
    Literal           "disabled"
    Local             disabled
    Literal           2
    MakeRecord
    Kinded
func_3d()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Confirm"
    Literal           "confirm"
    Literal           "Are you sure ?"
    Literal           "onClick"
    FunctionRef       name: func_3e
    Literal           "disabled"
    Local             disabled
    Literal           4
    MakeRecord
    Kinded
func_3e()
  entry:
    Literal           "Confirmed !"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             log
    Call
func_3f()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Secondary"
    Literal           "secondary"
    Literal           true
    Literal           "disabled"
    Local             disabled
    Literal           3
    MakeRecord
    Kinded
func_40()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Outline"
    Literal           "outline"
    Literal           true
    Literal           "disabled"
    Local             disabled
    Literal           3
    MakeRecord
    Kinded
func_41()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Outline Secondary"
    Literal           "secondary"
    Literal           true
    Literal           "outline"
    Literal           true
    Literal           "disabled"
    Local             disabled
    Literal           4
    MakeRecord
    Kinded
func_42()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Link"
    Literal           "link"
    Literal           true
    Literal           "disabled"
    Local             disabled
    Literal           "onClick"
    FunctionRef       name: func_43
    Literal           4
    MakeRecord
    Kinded
func_43()
  entry:
    Literal           "link click"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             log
    Call
func_44()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Link Secondary"
    Literal           "secondary"
    Literal           true
    Literal           "link"
    Literal           true
    Literal           "disabled"
    Local             disabled
    Literal           "onClick"
    FunctionRef       name: func_45
    Literal           5
    MakeRecord
    Kinded
func_45()
  entry:
    Literal           "link click secondary"
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             log
    Call
GalleryLink_46()
  entry:
    Literal           false
    DeclareLocal      name: value, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_47
    MakeArrayForBlock count: 2
func_47()
  entry:
    Local             Column
    FunctionRef       name: func_48
    FunctionRef       name: func_49
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_48()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Link"
    Literal           1
    MakeRecord
    Kinded
func_49()
  entry:
    Local             Link
    Literal           0
    MakeArray
    Literal           "url"
    Literal           "https://www.example.com"
    Literal           1
    MakeRecord
    Kinded
GalleryPager_4a()
  entry:
    Literal           1
    DeclareLocal      name: currentPage, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           true
    DeclareLocal      name: showPrevNext, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: disabled, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "2"
    DeclareLocal      name: size, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_4b
    MakeArrayForBlock count: 5
func_4b()
  entry:
    Local             Column
    FunctionRef       name: func_4c
    FunctionRef       name: func_4d
    FunctionRef       name: func_4f
    FunctionRef       name: func_51
    FunctionRef       name: func_55
    Literal           5
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_4c()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Pager"
    Literal           1
    MakeRecord
    Kinded
func_4d()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "showPrevNext"
    Literal           "value"
    Local             showPrevNext
    Literal           "onChange"
    FunctionRef       name: func_4e
    Literal           3
    MakeRecord
    Kinded
func_4e(newValue)
  entry:
    Local             newValue
    SetLocal          name: showPrevNext
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_4f()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "disabled"
    Literal           "value"
    Local             disabled
    Literal           "onChange"
    FunctionRef       name: func_50
    Literal           3
    MakeRecord
    Kinded
func_50(newValue)
  entry:
    Local             newValue
    SetLocal          name: disabled
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_51()
  entry:
    Local             Row
    FunctionRef       name: func_52
    FunctionRef       name: func_54
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_52()
  entry:
    Local             Select
    Literal           0
    MakeArray
    Literal           "options"
    Literal           "2"
    Literal           "3"
    Literal           "4"
    Literal           3
    MakeArray
    Literal           "value"
    Local             size
    Literal           "onChange"
    FunctionRef       name: func_53
    Literal           3
    MakeRecord
    Kinded
func_53(newValue)
  entry:
    Local             newValue
    SetLocal          name: size
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_54()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "size"
    Literal           1
    MakeRecord
    Kinded
func_55()
  entry:
    Local             Pager
    Literal           0
    MakeArray
    Literal           "max"
    Literal           100
    Literal           "perPage"
    Literal           10
    Literal           "showPrevNext"
    Local             showPrevNext
    Literal           "size"
    Local             size
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             string_to_number
    Call
    Literal           "disabled"
    Local             disabled
    Literal           "value"
    Local             currentPage
    Literal           "onChange"
    FunctionRef       name: func_56
    Literal           7
    MakeRecord
    Kinded
func_56(newValue)
  entry:
    Local             newValue
    SetLocal          name: currentPage
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
GallerySelect_57()
  entry:
    Literal           "Red"
    Literal           "Green"
    Literal           "value"
    Literal           "#00F"
    Literal           "label"
    Literal           "Blue"
    Literal           2
    MakeRecord
    Literal           3
    MakeArray
    DeclareLocal      name: values, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "Red"
    DeclareLocal      name: value, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    DeclareLocal      name: value2, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: disabled, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_58
    MakeArrayForBlock count: 5
func_58()
  entry:
    Local             Column
    FunctionRef       name: func_59
    FunctionRef       name: func_5a
    FunctionRef       name: func_5c
    FunctionRef       name: func_5e
    FunctionRef       name: func_60
    FunctionRef       name: func_61
    FunctionRef       name: func_63
    FunctionRef       name: func_65
    FunctionRef       name: func_69
    Literal           9
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_59()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Select Radio"
    Literal           1
    MakeRecord
    Kinded
func_5a()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "Disabled"
    Literal           "value"
    Local             disabled
    Literal           "onChange"
    FunctionRef       name: func_5b
    Literal           3
    MakeRecord
    Kinded
func_5b(newValue)
  entry:
    Local             newValue
    SetLocal          name: disabled
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_5c()
  entry:
    Local             Select
    Literal           0
    MakeArray
    Literal           "options"
    Local             values
    Literal           "placeholder"
    Literal           "Color"
    Literal           "disabled"
    Local             disabled
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_5d
    Literal           5
    MakeRecord
    Kinded
func_5d(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_5e()
  entry:
    Local             Select
    Literal           0
    MakeArray
    Literal           "options"
    Local             values
    Literal           "placeholder"
    Literal           "Color"
    Literal           "disabled"
    Local             disabled
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_5f
    Literal           5
    MakeRecord
    Kinded
func_5f(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_60()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Selected: "
    Local             value
    Intrinsic         INTRINSIC_ADD
    Literal           1
    MakeRecord
    Kinded
func_61()
  entry:
    Local             Select
    Literal           0
    MakeArray
    Literal           "options"
    Local             values
    Literal           "placeholder"
    Literal           "Color"
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_62
    Literal           4
    MakeRecord
    Kinded
func_62(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_63()
  entry:
    Local             Select
    Literal           0
    MakeArray
    Literal           "options"
    Local             values
    Literal           "placeholder"
    Literal           "Color"
    Literal           "disabled"
    Local             disabled
    Literal           "value"
    Local             value2
    Literal           "onChange"
    FunctionRef       name: func_64
    Literal           5
    MakeRecord
    Kinded
func_64(newValue)
  entry:
    Local             newValue
    SetLocal          name: value2
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_65()
  entry:
    Local             Row
    Local             values
    FunctionRef       name: func_66
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_map
    Call
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_66(option)
  entry:
    FunctionRef       name: func_67
func_67()
  entry:
    Local             Radio
    Literal           0
    MakeArray
    Literal           "option"
    Local             option
    Literal           "disabled"
    Local             disabled
    Literal           "label"
    Local             option
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             typeof
    Call
    Literal           "record"
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    ScopeEnter
    Local             option
    Attribute         name: label
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_3
  if_false_2:
    ScopeEnter
    Local             option
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_3
  if_end_3:
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_68
    Literal           5
    MakeRecord
    Kinded
func_68(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_69()
  entry:
    Local             Row
    Local             values
    FunctionRef       name: func_6a
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_map
    Call
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_6a(option)
  entry:
    FunctionRef       name: func_6b
func_6b()
  entry:
    Local             Radio
    Literal           0
    MakeArray
    Literal           "option"
    Local             option
    Literal           "disabled"
    Local             disabled
    Literal           "secondary"
    Literal           true
    Literal           "label"
    Local             option
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             typeof
    Call
    Literal           "record"
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_4
    Jump              if_false_5
  if_true_4:
    ScopeEnter
    Local             option
    Attribute         name: label
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_6
  if_false_5:
    ScopeEnter
    Local             option
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_6
  if_end_6:
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_6c
    Literal           6
    MakeRecord
    Kinded
func_6c(newValue)
  entry:
    Local             newValue
    SetLocal          name: value
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
GalleryTable_6d()
  entry:
    Literal           false
    DeclareLocal      name: useRemaining, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: noHeader, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           true
    DeclareLocal      name: striped, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: noHighlight, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: bordered, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "name"
    Literal           "Toto"
    Literal           "age"
    Literal           "32"
    Literal           2
    MakeRecord
    Literal           "name"
    Literal           "Tata"
    Literal           "age"
    Literal           "40"
    Literal           2
    MakeRecord
    Literal           "name"
    Literal           "Titi"
    Literal           "age"
    Literal           "13"
    Literal           2
    MakeRecord
    Literal           "name"
    Literal           "Tutu"
    Literal           "age"
    Literal           "132"
    Literal           "secret"
    Literal           true
    Literal           3
    MakeRecord
    Literal           4
    MakeArray
    DeclareLocal      name: data, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_6e
    MakeArrayForBlock count: 7
func_6e()
  entry:
    Local             Column
    FunctionRef       name: func_6f
    FunctionRef       name: func_70
    FunctionRef       name: func_72
    FunctionRef       name: func_74
    FunctionRef       name: func_76
    FunctionRef       name: func_78
    FunctionRef       name: func_7a
    FunctionRef       name: func_80
    FunctionRef       name: func_81
    Literal           9
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_6f()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Table"
    Literal           1
    MakeRecord
    Kinded
func_70()
  entry:
    Local             CheckBox
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "Name column must use remaining space"
    Literal           "value"
    Local             useRemaining
    Literal           "onChange"
    FunctionRef       name: func_71
    Literal           3
    MakeRecord
    Kinded
func_71(newValue)
  entry:
    Local             newValue
    SetLocal          name: useRemaining
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_72()
  entry:
    Local             CheckBox
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "No header"
    Literal           "value"
    Local             noHeader
    Literal           "onChange"
    FunctionRef       name: func_73
    Literal           3
    MakeRecord
    Kinded
func_73(newValue)
  entry:
    Local             newValue
    SetLocal          name: noHeader
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_74()
  entry:
    Local             CheckBox
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "Striped"
    Literal           "value"
    Local             striped
    Literal           "onChange"
    FunctionRef       name: func_75
    Literal           3
    MakeRecord
    Kinded
func_75(newValue)
  entry:
    Local             newValue
    SetLocal          name: striped
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_76()
  entry:
    Local             CheckBox
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "No Highlight"
    Literal           "value"
    Local             noHighlight
    Literal           "onChange"
    FunctionRef       name: func_77
    Literal           3
    MakeRecord
    Kinded
func_77(newValue)
  entry:
    Local             newValue
    SetLocal          name: noHighlight
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_78()
  entry:
    Local             CheckBox
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "Bordered"
    Literal           "value"
    Local             bordered
    Literal           "onChange"
    FunctionRef       name: func_79
    Literal           3
    MakeRecord
    Kinded
func_79(newValue)
  entry:
    Local             newValue
    SetLocal          name: bordered
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_7a()
  entry:
    Local             Table
    Literal           0
    MakeArray
    Literal           "_key"
    FunctionRef       name: func_7b
    Literal           "noHeader"
    Local             noHeader
    Literal           "striped"
    Local             striped
    Literal           "noHighlight"
    Local             noHighlight
    Literal           "bordered"
    Local             bordered
    Literal           "columns"
    Literal           "description"
    Literal           "Name"
    Literal           "display"
    FunctionRef       name: func_7c
    Literal           "useRemaining"
    Local             useRemaining
    Literal           3
    MakeRecord
    Literal           "description"
    Literal           "Age"
    Literal           "display"
    FunctionRef       name: func_7e
    Literal           2
    MakeRecord
    Literal           2
    MakeArray
    Literal           "values"
    Local             data
    Literal           7
    MakeRecord
    Kinded
func_7b(row)
  entry:
    Local             row
    Attribute         name: name
func_7c(row)
  entry:
    FunctionRef       name: func_7d
func_7d()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Local             row
    Attribute         name: name
    Literal           1
    MakeRecord
    Kinded
func_7e(row)
  entry:
    FunctionRef       name: func_7f
func_7f()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Local             row
    Attribute         name: age
    Literal           1
    MakeRecord
    Kinded
func_80()
  entry:
    Local             Table
    Literal           0
    MakeArray
    Literal           "values"
    Local             data
    Literal           "noHeader"
    Local             noHeader
    Literal           "noHighlight"
    Local             noHighlight
    Literal           "bordered"
    Local             bordered
    Literal           "striped"
    Local             striped
    Literal           5
    MakeRecord
    Kinded
func_81()
  entry:
    Local             Table
    Literal           0
    MakeArray
    Literal           "noHeader"
    Local             noHeader
    Literal           "noHighlight"
    Local             noHighlight
    Literal           "striped"
    Local             striped
    Literal           "bordered"
    Local             bordered
    Literal           "columns"
    Literal           "name"
    Literal           "description"
    Literal           "Age"
    Literal           "display"
    FunctionRef       name: func_82
    Literal           2
    MakeRecord
    Literal           2
    MakeArray
    Literal           "values"
    Local             data
    Literal           6
    MakeRecord
    Kinded
func_82(row)
  entry:
    FunctionRef       name: func_83
func_83()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Local             row
    Attribute         name: age
    Literal           " years old"
    Intrinsic         INTRINSIC_ADD
    Literal           1
    MakeRecord
    Kinded
GalleryTabs_84()
  entry:
    Literal           "first"
    DeclareLocal      name: currentTab, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: hasAfter, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_85
    MakeArrayForBlock count: 3
func_85()
  entry:
    Local             Column
    FunctionRef       name: func_86
    FunctionRef       name: func_87
    FunctionRef       name: func_89
    Local             currentTab
    Literal           "first"
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_10
    Jump              if_false_11
  if_true_10:
    FunctionRef       name: func_8e
    Jump              if_end_12
  if_false_11:
    Local             currentTab
    Literal           "second"
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_13
    Jump              if_false_14
  if_true_13:
    FunctionRef       name: func_8f
    Jump              if_end_15
  if_false_14:
    Literal           null
    Jump              if_end_15
  if_end_15:
    Jump              if_end_12
  if_end_12:
    Literal           4
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_86()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Tabs"
    Literal           1
    MakeRecord
    Kinded
func_87()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "Has after"
    Literal           "value"
    Local             hasAfter
    Literal           "onChange"
    FunctionRef       name: func_88
    Literal           3
    MakeRecord
    Kinded
func_88(newValue)
  entry:
    Local             newValue
    SetLocal          name: hasAfter
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_89()
  entry:
    Local             Tabs
    Literal           0
    MakeArray
    Literal           "options"
    Literal           "label"
    Literal           "First tab"
    Literal           "value"
    Literal           "first"
    Literal           2
    MakeRecord
    Literal           "label"
    Literal           "Second tab"
    Literal           "value"
    Literal           "second"
    Literal           2
    MakeRecord
    Literal           2
    MakeArray
    Literal           "after"
    Local             hasAfter
    JumpTrue          if_true_7
    Jump              if_false_8
  if_true_7:
    ScopeEnter
    FunctionRef       name: func_8a
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_9
  if_false_8:
    ScopeEnter
    Literal           null
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_9
  if_end_9:
    Literal           "value"
    Local             currentTab
    Literal           "onChange"
    FunctionRef       name: func_8d
    Literal           4
    MakeRecord
    Kinded
func_8a()
  entry:
    Local             Row
    FunctionRef       name: func_8b
    Literal           1
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             flex
    Call
    FunctionRef       name: func_8c
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_8b()
  entry:
    Local             View
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_8c()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "After"
    Literal           "outline"
    Literal           true
    Literal           2
    MakeRecord
    Kinded
func_8d(newValue)
  entry:
    Local             newValue
    SetLocal          name: currentTab
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_8e()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "First tab"
    Literal           1
    MakeRecord
    Kinded
func_8f()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Second tab"
    Literal           1
    MakeRecord
    Kinded
GalleryLoader_90()
  entry:
    Literal           4
    DeclareLocal      name: value, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           10
    DeclareLocal      name: max, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: primary, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: secondary, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "md"
    DeclareLocal      name: size, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_91
    MakeArrayForBlock count: 6
func_91()
  entry:
    Local             Column
    FunctionRef       name: func_92
    FunctionRef       name: func_93
    FunctionRef       name: func_98
    FunctionRef       name: func_9f
    FunctionRef       name: func_a0
    FunctionRef       name: func_a5
    Literal           6
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_92()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Loader"
    Literal           1
    MakeRecord
    Kinded
func_93()
  entry:
    Local             Row
    FunctionRef       name: func_94
    FunctionRef       name: func_96
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_94()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "Primary"
    Literal           "value"
    Local             primary
    Literal           "onChange"
    FunctionRef       name: func_95
    Literal           3
    MakeRecord
    Kinded
func_95(newValue)
  entry:
    Local             newValue
    SetLocal          name: primary
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_96()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "Secondary"
    Literal           "value"
    Local             secondary
    Literal           "onChange"
    FunctionRef       name: func_97
    Literal           3
    MakeRecord
    Kinded
func_97(newValue)
  entry:
    Local             newValue
    SetLocal          name: secondary
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_98()
  entry:
    Local             Row
    FunctionRef       name: func_99
    FunctionRef       name: func_9b
    FunctionRef       name: func_9d
    Literal           3
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_99()
  entry:
    Local             Radio
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "sm"
    Literal           "option"
    Literal           "sm"
    Literal           "value"
    Local             size
    Literal           "onChange"
    FunctionRef       name: func_9a
    Literal           4
    MakeRecord
    Kinded
func_9a(newValue)
  entry:
    Local             newValue
    SetLocal          name: size
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_9b()
  entry:
    Local             Radio
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "md"
    Literal           "option"
    Literal           "md"
    Literal           "value"
    Local             size
    Literal           "onChange"
    FunctionRef       name: func_9c
    Literal           4
    MakeRecord
    Kinded
func_9c(newValue)
  entry:
    Local             newValue
    SetLocal          name: size
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_9d()
  entry:
    Local             Radio
    Literal           0
    MakeArray
    Literal           "label"
    Literal           "lg"
    Literal           "option"
    Literal           "lg"
    Literal           "value"
    Local             size
    Literal           "onChange"
    FunctionRef       name: func_9e
    Literal           4
    MakeRecord
    Kinded
func_9e(newValue)
  entry:
    Local             newValue
    SetLocal          name: size
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_9f()
  entry:
    Local             Loader
    Literal           0
    MakeArray
    Literal           "primary"
    Local             primary
    Literal           "secondary"
    Local             secondary
    Literal           "size"
    Local             size
    Literal           3
    MakeRecord
    Kinded
func_a0()
  entry:
    Local             Row
    Literal           "Value:"
    FunctionRef       name: func_a1
    Literal           "Max:"
    FunctionRef       name: func_a3
    Literal           4
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_a1()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "value"
    Local             value
    Literal           "onChange"
    FunctionRef       name: func_a2
    Literal           2
    MakeRecord
    Kinded
func_a2(newValue)
  entry:
    Local             newValue
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             string_to_number
    Call
    SetLocal          name: value
func_a3()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "value"
    Local             max
    Literal           "onChange"
    FunctionRef       name: func_a4
    Literal           2
    MakeRecord
    Kinded
func_a4(newValue)
  entry:
    Local             newValue
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             string_to_number
    Call
    SetLocal          name: max
func_a5()
  entry:
    Local             Loader
    Literal           0
    MakeArray
    Literal           "primary"
    Local             primary
    Literal           "secondary"
    Local             secondary
    Literal           "size"
    Local             size
    Literal           "max"
    Local             max
    Literal           "value"
    Local             value
    Literal           5
    MakeRecord
    Kinded
GalleryOverlay_a6()
  entry:
    DeclareLocal      name: showOverlay, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    DeclareLocal      name: position, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    DeclareLocal      name: modal, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    Literal           "m"
    DeclareLocal      name: size, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_a7
    MakeArrayForBlock count: 5
func_a7()
  entry:
    Local             Column
    FunctionRef       name: func_a8
    FunctionRef       name: func_a9
    FunctionRef       name: func_b1
    FunctionRef       name: func_b3
    FunctionRef       name: func_b5
    FunctionRef       name: func_b7
    Local             showOverlay
    JumpTrue          if_true_16
    Jump              if_false_17
  if_true_16:
    ScopeEnter
    FunctionRef       name: func_b9
    Literal           1
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Jump              if_end_18
  if_false_17:
    Literal           null
    Jump              if_end_18
  if_end_18:
    Literal           7
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_a8()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Overlay"
    Literal           1
    MakeRecord
    Kinded
func_a9()
  entry:
    Local             Row
    FunctionRef       name: func_aa
    FunctionRef       name: func_ab
    FunctionRef       name: func_ad
    FunctionRef       name: func_af
    Literal           4
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_aa()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Size"
    Literal           1
    MakeRecord
    Kinded
func_ab()
  entry:
    Local             Radio
    Literal           0
    MakeArray
    Literal           "option"
    Literal           "m"
    Literal           "label"
    Literal           "m"
    Literal           "value"
    Local             size
    Literal           "onChange"
    FunctionRef       name: func_ac
    Literal           4
    MakeRecord
    Kinded
func_ac(newValue)
  entry:
    Local             newValue
    SetLocal          name: size
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_ad()
  entry:
    Local             Radio
    Literal           0
    MakeArray
    Literal           "option"
    Literal           "l"
    Literal           "label"
    Literal           "l"
    Literal           "value"
    Local             size
    Literal           "onChange"
    FunctionRef       name: func_ae
    Literal           4
    MakeRecord
    Kinded
func_ae(newValue)
  entry:
    Local             newValue
    SetLocal          name: size
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_af()
  entry:
    Local             Radio
    Literal           0
    MakeArray
    Literal           "option"
    Literal           "xl"
    Literal           "label"
    Literal           "xl"
    Literal           "value"
    Local             size
    Literal           "onChange"
    FunctionRef       name: func_b0
    Literal           4
    MakeRecord
    Kinded
func_b0(newValue)
  entry:
    Local             newValue
    SetLocal          name: size
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_b1()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Show Dialog"
    Literal           "onClick"
    FunctionRef       name: func_b2
    Literal           2
    MakeRecord
    Kinded
func_b2()
  entry:
    Literal           "center"
    SetLocal          name: position
    Pop               inBlock: false
    Literal           false
    SetLocal          name: modal
    Pop               inBlock: false
    Literal           true
    SetLocal          name: showOverlay
    MakeArrayForBlock count: 3
func_b3()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Show Modal"
    Literal           "onClick"
    FunctionRef       name: func_b4
    Literal           2
    MakeRecord
    Kinded
func_b4()
  entry:
    Literal           "center"
    SetLocal          name: position
    Pop               inBlock: false
    Literal           true
    SetLocal          name: modal
    Pop               inBlock: false
    Literal           true
    SetLocal          name: showOverlay
    MakeArrayForBlock count: 3
func_b5()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Show Drawer Left"
    Literal           "onClick"
    FunctionRef       name: func_b6
    Literal           2
    MakeRecord
    Kinded
func_b6()
  entry:
    Literal           "left"
    SetLocal          name: position
    Pop               inBlock: false
    Literal           true
    SetLocal          name: modal
    Pop               inBlock: false
    Literal           true
    SetLocal          name: showOverlay
    MakeArrayForBlock count: 3
func_b7()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Show Drawer Bottom"
    Literal           "onClick"
    FunctionRef       name: func_b8
    Literal           2
    MakeRecord
    Kinded
func_b8()
  entry:
    Literal           "bottom"
    SetLocal          name: position
    Pop               inBlock: false
    Literal           true
    SetLocal          name: modal
    Pop               inBlock: false
    Literal           true
    SetLocal          name: showOverlay
    MakeArrayForBlock count: 3
func_b9()
  entry:
    Local             Overlay
    FunctionRef       name: func_ba
    FunctionRef       name: func_bb
    Literal           2
    MakeArray
    Literal           "position"
    Local             position
    Literal           "modal"
    Local             modal
    Literal           "title"
    Literal           "Title here"
    Literal           "onClose"
    FunctionRef       name: func_bc
    Literal           "size"
    Local             size
    Literal           5
    MakeRecord
    Kinded
func_ba()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Overlay content"
    Literal           1
    MakeRecord
    Kinded
func_bb()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Press on the backdrop to close it"
    Literal           1
    MakeRecord
    Kinded
func_bc()
  entry:
    Literal           false
    SetLocal          name: showOverlay
GalleryErrorHandling_bd()
  entry:
    FunctionRef       name: func_be
    MakeArrayForBlock count: 1
func_be()
  entry:
    Local             Column
    FunctionRef       name: func_bf
    FunctionRef       name: func_c0
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_bf()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Error handling"
    Literal           1
    MakeRecord
    Kinded
func_c0()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Trigger error"
    Literal           "onClick"
    FunctionRef       name: func_c1
    Literal           2
    MakeRecord
    Kinded
func_c1()
  entry:
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Local             unknown_function
    Call
GallerySnippet_c2()
  entry:
    FunctionRef       name: func_c3
    MakeArrayForBlock count: 1
func_c3()
  entry:
    Local             Column
    FunctionRef       name: func_c4
    FunctionRef       name: func_c5
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_c4()
  entry:
    Local             Title
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Snippet"
    Literal           1
    MakeRecord
    Kinded
func_c5()
  entry:
    Local             Snippet
    Literal           0
    MakeArray
    Literal           "language"
    Literal           "javascript"
    Literal           "text"
    Literal           "console.log('Hello, World !')"
    Literal           2
    MakeRecord
    Kinded
func_c6()
  entry:
    Local             Column
    FunctionRef       name: func_c7
    Literal           "toy-box"
    DeclareLocal      name: currentTheme, mutable: true, hasInitialValue: true
    Literal           "html"
    Literal           "toy-box"
    Literal           "twbs"
    Literal           "twbs-dark"
    Literal           "nes-css"
    Literal           "dark-orange"
    Literal           "98"
    Literal           "mozaic-lm"
    Literal           8
    MakeArray
    DeclareLocal      name: themes, mutable: false, hasInitialValue: true
    FunctionRef       name: func_c8
    Literal           4
    MakeArray
    Literal           "padding"
    Literal           0.5
    Literal           1
    MakeRecord
    Kinded
func_c7()
  entry:
    Local             Debug
    Literal           0
    MakeArray
    Literal           "value"
    Literal           "Debug enabled !"
    Literal           1
    MakeRecord
    Kinded
func_c8()
  entry:
    Local             Column
    FunctionRef       name: func_c9
    FunctionRef       name: func_cd
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_c9()
  entry:
    Local             Row
    FunctionRef       name: func_ca
    FunctionRef       name: func_cb
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_ca()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Change theme: "
    Literal           1
    MakeRecord
    Kinded
func_cb()
  entry:
    Local             Select
    Literal           0
    MakeArray
    Literal           "value"
    Local             currentTheme
    Literal           "onChange"
    FunctionRef       name: func_cc
    Literal           "options"
    Local             themes
    Literal           3
    MakeRecord
    Kinded
func_cc(newVal)
  entry:
    Local             newVal
    SetLocal          name: currentTheme
    Pop               inBlock: false
    Literal           "theme"
    Local             newVal
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             set_system_property
    Call
    MakeArrayForBlock count: 2
func_cd()
  entry:
    Local             Row
    FunctionRef       name: func_ce
    FunctionRef       name: func_d0
    FunctionRef       name: func_d2
    FunctionRef       name: func_d4
    FunctionRef       name: func_d6
    FunctionRef       name: func_d8
    FunctionRef       name: func_da
    FunctionRef       name: func_dc
    FunctionRef       name: func_de
    FunctionRef       name: func_e0
    FunctionRef       name: func_e2
    FunctionRef       name: func_e4
    FunctionRef       name: func_e6
    Literal           13
    MakeArray
    Literal           "wrap"
    Literal           true
    Literal           1
    MakeRecord
    Kinded
func_ce()
  entry:
    Local             View
    FunctionRef       name: func_cf
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_cf()
  entry:
    Local             GalleryInputText
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_d0()
  entry:
    Local             View
    FunctionRef       name: func_d1
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_d1()
  entry:
    Local             GalleryText
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_d2()
  entry:
    Local             View
    FunctionRef       name: func_d3
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_d3()
  entry:
    Local             GalleryCheckbox
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_d4()
  entry:
    Local             View
    FunctionRef       name: func_d5
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_d5()
  entry:
    Local             GalleryButton
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_d6()
  entry:
    Local             View
    FunctionRef       name: func_d7
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_d7()
  entry:
    Local             GalleryLink
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_d8()
  entry:
    Local             View
    FunctionRef       name: func_d9
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_d9()
  entry:
    Local             GalleryPager
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_da()
  entry:
    Local             View
    FunctionRef       name: func_db
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_db()
  entry:
    Local             GalleryErrorHandling
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_dc()
  entry:
    Local             View
    FunctionRef       name: func_dd
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_dd()
  entry:
    Local             GallerySelect
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_de()
  entry:
    Local             View
    FunctionRef       name: func_df
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_df()
  entry:
    Local             GalleryTable
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_e0()
  entry:
    Local             View
    FunctionRef       name: func_e1
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_e1()
  entry:
    Local             GalleryTabs
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_e2()
  entry:
    Local             View
    FunctionRef       name: func_e3
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_e3()
  entry:
    Local             GalleryLoader
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_e4()
  entry:
    Local             View
    FunctionRef       name: func_e5
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_e5()
  entry:
    Local             GalleryOverlay
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_e6()
  entry:
    Local             View
    FunctionRef       name: func_e7
    Literal           1
    MakeArray
    Literal           "width"
    Literal           "360px"
    Literal           1
    MakeRecord
    Kinded
func_e7()
  entry:
    Local             GallerySnippet
    Literal           0
    MakeArray
    Literal           0
    MakeRecord
    Kinded
