main()
  entry:
    Literal 0
    MakeArray
    Literal "key"
    Literal "title"
    Literal "value"
    Literal "HTTP Client demo"
    Literal 2
    MakeRecord
    Local             name: set_system_property
    Call
    Pop               inBlock: false
    Literal 0
    MakeArray
    DeclareLocal      name: headers, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal null
    DeclareLocal      name: body, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal "text"
    DeclareLocal      name: language, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal false
    DeclareLocal      name: doFormat, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal false
    DeclareLocal      name: doShowHeaders, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal "GET"
    DeclareLocal      name: method, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    DeclareLocal      name: url, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    DeclareLocal      name: response, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    DeclareLocal      name: responseBodyString, mutable: true, hasInitialValue: false
    Pop               inBlock: false
    FunctionRef       name: executeHttpRequest_0
    DeclareLocal      name: executeHttpRequest, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    FunctionRef       name: func_2
executeHttpRequest_0()
  entry:
    Local             name: method
    Local             name: url
    Local             name: headers
    FunctionRef       name: func_1
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: array_filter
    Call
    Local             name: body
    Literal 4
    MakeArray
    Literal "allowErrorStatusCode"
    Literal true
    Literal 1
    MakeRecord
    Local             name: http_request
    Call
    SetLocal          name: response
    Pop               inBlock: false
    Try               catchLabel: try_catch_4, endTryLabel: try_end_5
    ScopeEnter
    Literal 0
    Literal "content-type"
    Local             name: response
    Attribute         name: headers
    Index
    Literal ";"
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: string_split
    Call
    Index
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: string_trim
    Call
    DeclareLocal      name: contentType, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: contentType
    Literal "text/html"
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_6
    Jump              label: if_false_7
  if_true_6:
    ScopeEnter
    Literal "html"
    SetLocal          name: language
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_8
  if_false_7:
    Local             name: contentType
    Literal "application/json"
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_9
    Jump              label: if_false_10
  if_true_9:
    ScopeEnter
    Literal "json"
    SetLocal          name: language
    Pop               inBlock: false
    Literal true
    SetLocal          name: doFormat
    ScopeLeave        inBlock: false, count: 2
    Jump              label: if_end_11
  if_false_10:
    Local             name: contentType
    Literal "text/javascript"
    Intrinsic         operation: INTRINSIC_EQUAL
    JumpTrue          label: if_true_12
    Jump              label: if_false_13
  if_true_12:
    ScopeEnter
    Literal "javascript"
    SetLocal          name: language
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_14
  if_false_13:
    Literal null
    Jump              label: if_end_14
  if_end_14:
    Jump              label: if_end_11
  if_end_11:
    Jump              label: if_end_8
  if_end_8:
    ScopeLeave        inBlock: false, count: 2
    TryPop
    Jump              label: try_end_5
  try_catch_4:
    Literal null
    Jump              label: try_end_5
  try_end_5:
    Pop               inBlock: false
    Local             name: response
    Attribute         name: body
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: bytes_to_string
    Call
    SetLocal          name: responseBodyString
    MakeArrayForBlock count: 3
func_1([object Object])
  entry:
    Literal 0
    Local             name: it
    Index
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: tmp_left
    JumpTrue          label: if_true_1
    Jump              label: if_false_2
  if_true_1:
    Literal 1
    Local             name: it
    Index
    Jump              label: if_end_3
  if_false_2:
    Local             name: tmp_left
    Jump              label: if_end_3
  if_end_3:
    MakeArrayForBlock count: 2
func_2()
  entry:
    Local             name: Column
    FunctionRef       name: func_3
    Local             name: headers
    FunctionRef       name: func_a
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: array_map
    Call
    FunctionRef       name: func_15
    FunctionRef       name: func_17
    FunctionRef       name: func_19
    FunctionRef       name: func_1b
    ScopeEnter
    Local             name: headers
    FunctionRef       name: func_1c
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: array_filter
    Call
    DeclareLocal      name: validHeaders, mutable: false, hasInitialValue: true
    ScopeEnter
    Local             name: method
    Literal null
    Intrinsic         operation: INTRINSIC_NOT_EQUAL
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: tmp_left
    JumpTrue          label: if_true_18
    Jump              label: if_false_19
  if_true_18:
    Local             name: url
    Literal null
    Intrinsic         operation: INTRINSIC_NOT_EQUAL
    Jump              label: if_end_20
  if_false_19:
    Local             name: tmp_left
    Jump              label: if_end_20
  if_end_20:
    ScopeLeave        inBlock: false, count: 2
    JumpTrue          label: if_true_21
    Jump              label: if_false_22
  if_true_21:
    ScopeEnter
    FunctionRef       name: func_1d
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_23
  if_false_22:
    Literal null
    Jump              label: if_end_23
  if_end_23:
    ScopeEnter
    Local             name: method
    Literal null
    Intrinsic         operation: INTRINSIC_NOT_EQUAL
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: tmp_left
    JumpTrue          label: if_true_24
    Jump              label: if_false_25
  if_true_24:
    Local             name: url
    Literal null
    Intrinsic         operation: INTRINSIC_NOT_EQUAL
    Jump              label: if_end_26
  if_false_25:
    Local             name: tmp_left
    Jump              label: if_end_26
  if_end_26:
    ScopeLeave        inBlock: false, count: 2
    JumpTrue          label: if_true_27
    Jump              label: if_false_28
  if_true_27:
    ScopeEnter
    FunctionRef       name: func_1f
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_29
  if_false_28:
    Literal null
    Jump              label: if_end_29
  if_end_29:
    Literal 2
    MakeArray
    Literal 2
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Local             name: response
    Literal null
    Intrinsic         operation: INTRINSIC_NOT_EQUAL
    JumpTrue          label: if_true_39
    Jump              label: if_false_40
  if_true_39:
    ScopeEnter
    FunctionRef       name: func_20
    Literal 1
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Jump              label: if_end_41
  if_false_40:
    Literal null
    Jump              label: if_end_41
  if_end_41:
    Literal 8
    MakeArray
    Literal 0
    MakeRecord
    Kinded
func_3()
  entry:
    Local             name: Row
    FunctionRef       name: func_4
    FunctionRef       name: func_7
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Kinded
func_4()
  entry:
    Local             name: Box
    FunctionRef       name: func_5
    Literal 1
    MakeArray
    Literal "flex"
    Literal 0
    Literal 1
    MakeRecord
    Kinded
func_5()
  entry:
    Local             name: Select
    Literal 0
    MakeArray
    Literal "placeholder"
    Literal "Method"
    Literal "options"
    Literal "GET"
    Literal "POST"
    Literal "PUT"
    Literal "PATCH"
    Literal "DELETE"
    Literal "LIST"
    Literal "HEAD"
    Literal "OPTIONS"
    Literal 8
    MakeArray
    Literal "value"
    Local             name: method
    Literal "onChange"
    FunctionRef       name: func_6
    Literal 4
    MakeRecord
    Kinded
func_6([object Object])
  entry:
    Local             name: newValue
    SetLocal          name: method
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_7()
  entry:
    Local             name: Box
    FunctionRef       name: func_8
    Literal 1
    MakeArray
    Literal "flex"
    Literal 1
    Literal 1
    MakeRecord
    Kinded
func_8()
  entry:
    Local             name: InputText
    Literal 0
    MakeArray
    Literal "placeholder"
    Literal "URL"
    Literal "type"
    Literal "url"
    Literal "onSubmit"
    Local             name: executeHttpRequest
    Literal "value"
    Local             name: url
    Literal "onChange"
    FunctionRef       name: func_9
    Literal 5
    MakeRecord
    Kinded
func_9([object Object])
  entry:
    Local             name: newValue
    SetLocal          name: url
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_a([object Object], [object Object])
  entry:
    FunctionRef       name: func_b
    Literal 1
    MakeArray
func_b()
  entry:
    Local             name: Row
    FunctionRef       name: func_c
    FunctionRef       name: func_f
    FunctionRef       name: func_12
    Literal 3
    MakeArray
    Literal 0
    MakeRecord
    Kinded
func_c()
  entry:
    Local             name: Box
    FunctionRef       name: func_d
    Literal 1
    MakeArray
    Literal "flex"
    Literal 1
    Literal 1
    MakeRecord
    Kinded
func_d()
  entry:
    Local             name: InputText
    Literal 0
    MakeArray
    Literal "placeholder"
    Literal "Header name"
    Literal "value"
    Literal 0
    Local             name: it
    Index
    Literal "onChange"
    FunctionRef       name: func_e
    Literal 3
    MakeRecord
    Kinded
func_e([object Object])
  entry:
    Literal 0
    Local             name: it
    Local             name: newValue
    SetIndex          forceRender: true
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_f()
  entry:
    Local             name: Box
    FunctionRef       name: func_10
    Literal 1
    MakeArray
    Literal "flex"
    Literal 3
    Literal 1
    MakeRecord
    Kinded
func_10()
  entry:
    Local             name: InputText
    Literal 0
    MakeArray
    Literal "placeholder"
    Literal "Header value"
    Literal "value"
    Literal 1
    Local             name: it
    Index
    Literal "onChange"
    FunctionRef       name: func_11
    Literal 3
    MakeRecord
    Kinded
func_11([object Object])
  entry:
    Literal 1
    Local             name: it
    Local             name: newValue
    SetIndex          forceRender: true
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_12()
  entry:
    Local             name: Box
    FunctionRef       name: func_13
    Literal 1
    MakeArray
    Literal "flex"
    Literal 0
    Literal 1
    MakeRecord
    Kinded
func_13()
  entry:
    Local             name: Button
    Literal 0
    MakeArray
    Literal "text"
    Literal "Remove"
    Literal "onClick"
    FunctionRef       name: func_14
    Literal 2
    MakeRecord
    Kinded
func_14()
  entry:
    Local             name: headers
    Local             name: index
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: array_remove
    Call
    SetLocal          name: headers
func_15()
  entry:
    Local             name: Button
    Literal 0
    MakeArray
    Literal "onClick"
    FunctionRef       name: func_16
    Literal "text"
    Literal "Add user agent header"
    Literal 2
    MakeRecord
    Kinded
func_16()
  entry:
    Local             name: headers
    Literal "user-agent"
    Literal "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
    Literal 2
    MakeArray
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: array_append
    Call
    SetLocal          name: headers
func_17()
  entry:
    Local             name: Button
    Literal 0
    MakeArray
    Literal "text"
    Literal "New header"
    Literal "onClick"
    ScopeEnter
    FunctionRef       name: func_18
    ScopeLeave        inBlock: false, count: 1
    Literal 2
    MakeRecord
    Kinded
func_18()
  entry:
    Local             name: headers
    Literal ""
    Literal ""
    Literal 2
    MakeArray
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: array_append
    Call
    SetLocal          name: headers
func_19()
  entry:
    Local             name: InputText
    Literal 0
    MakeArray
    Literal "placeholder"
    Literal "body"
    Literal "multiline"
    Literal true
    Literal "value"
    Local             name: body
    Literal "onChange"
    FunctionRef       name: func_1a
    Literal 4
    MakeRecord
    Kinded
func_1a([object Object])
  entry:
    Local             name: newValue
    SetLocal          name: body
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_1b()
  entry:
    Local             name: Button
    Literal 0
    MakeArray
    Literal "text"
    Literal "Execute HTTP Request"
    Literal "onClick"
    Local             name: executeHttpRequest
    Literal 2
    MakeRecord
    Kinded
func_1c([object Object])
  entry:
    Literal 0
    Local             name: it
    Index
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: tmp_left
    JumpTrue          label: if_true_15
    Jump              label: if_false_16
  if_true_15:
    Literal 1
    Local             name: it
    Index
    Jump              label: if_end_17
  if_false_16:
    Local             name: tmp_left
    Jump              label: if_end_17
  if_end_17:
    MakeArrayForBlock count: 2
func_1d()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "copy"
    Literal true
    Literal "text"
    Literal "curl -X $method $headers '$url'"
    Literal "method"
    Local             name: method
    Literal "url"
    Local             name: url
    Literal "headers"
    Local             name: validHeaders
    FunctionRef       name: func_1e
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: array_map
    Call
    Literal " "
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: array_join
    Call
    Literal 3
    MakeRecord
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: string_format
    Call
    Literal 2
    MakeRecord
    Kinded
func_1e([object Object])
  entry:
    Literal "-H '$name: $value'"
    Literal "name"
    Literal 0
    Local             name: it
    Index
    Literal "value"
    Literal 1
    Local             name: it
    Index
    Literal 2
    MakeRecord
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: string_format
    Call
func_1f()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "copy"
    Literal true
    Literal "text"
    Literal "http_request(method: \"$method\", url: \"$url\" $headers $body)"
    Literal "method"
    Local             name: method
    Literal "url"
    Local             name: url
    Literal "body"
    ScopeEnter
    Local             name: body
    Literal null
    Intrinsic         operation: INTRINSIC_NOT_EQUAL
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: tmp_left
    JumpTrue          label: if_true_30
    Jump              label: if_false_31
  if_true_30:
    Local             name: body
    Literal ""
    Intrinsic         operation: INTRINSIC_NOT_EQUAL
    Jump              label: if_end_32
  if_false_31:
    Local             name: tmp_left
    Jump              label: if_end_32
  if_end_32:
    ScopeLeave        inBlock: false, count: 2
    JumpTrue          label: if_true_33
    Jump              label: if_false_34
  if_true_33:
    ScopeEnter
    Literal ", body: \""
    Local             name: body
    Intrinsic         operation: INTRINSIC_ADD
    Literal "\""
    Intrinsic         operation: INTRINSIC_ADD
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_35
  if_false_34:
    ScopeEnter
    Literal " "
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_35
  if_end_35:
    Literal "headers"
    Local             name: validHeaders
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: array_length
    Call
    Literal 0
    Intrinsic         operation: INTRINSIC_GREATER
    JumpTrue          label: if_true_36
    Jump              label: if_false_37
  if_true_36:
    ScopeEnter
    Literal ", headers:"
    Local             name: validHeaders
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: json_stringify
    Call
    Intrinsic         operation: INTRINSIC_ADD
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_38
  if_false_37:
    ScopeEnter
    Literal " "
    ScopeLeave        inBlock: false, count: 1
    Jump              label: if_end_38
  if_end_38:
    Literal 4
    MakeRecord
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: string_format
    Call
    Literal 2
    MakeRecord
    Kinded
func_20()
  entry:
    Local             name: Column
    FunctionRef       name: func_21
    FunctionRef       name: func_23
    Local             name: doShowHeaders
    JumpTrue          label: if_true_42
    Jump              label: if_false_43
  if_true_42:
    ScopeEnter
    FunctionRef       name: func_27
    Literal 1
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Jump              label: if_end_44
  if_false_43:
    Literal null
    Jump              label: if_end_44
  if_end_44:
    FunctionRef       name: func_2f
    FunctionRef       name: func_36
    Literal 5
    MakeArray
    Literal 0
    MakeRecord
    Kinded
func_21()
  entry:
    Local             name: Row
    FunctionRef       name: func_22
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Kinded
func_22()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "text"
    Literal "Status code: $status"
    Literal "status"
    Local             name: response
    Attribute         name: status
    Literal 1
    MakeRecord
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: string_format
    Call
    Literal 1
    MakeRecord
    Kinded
func_23()
  entry:
    Local             name: Row
    FunctionRef       name: func_24
    FunctionRef       name: func_25
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Kinded
func_24()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "text"
    Literal "Show headers"
    Literal 1
    MakeRecord
    Kinded
func_25()
  entry:
    Local             name: Switch
    Literal 0
    MakeArray
    Literal "value"
    Local             name: doShowHeaders
    Literal "onChange"
    FunctionRef       name: func_26
    Literal 2
    MakeRecord
    Kinded
func_26([object Object])
  entry:
    Local             name: newValue
    SetLocal          name: doShowHeaders
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_27()
  entry:
    Local             name: Column
    FunctionRef       name: func_28
    FunctionRef       name: func_29
    Literal 2
    MakeArray
    Literal "flexShrink"
    Literal 0
    Literal 1
    MakeRecord
    Kinded
func_28()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "text"
    Literal "Headers:"
    Literal 1
    MakeRecord
    Kinded
func_29()
  entry:
    Local             name: Table
    Literal 0
    MakeArray
    Literal "columns"
    Literal "description"
    Literal "Name"
    Literal "display"
    FunctionRef       name: func_2a
    Literal 2
    MakeRecord
    Literal "description"
    Literal "Value"
    Literal "display"
    FunctionRef       name: func_2c
    Literal 2
    MakeRecord
    Literal 2
    MakeArray
    Literal "values"
    Local             name: response
    Attribute         name: headers
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: object_entries
    Call
    FunctionRef       name: func_2e
    Literal 2
    MakeArray
    Literal 0
    MakeRecord
    Local             name: array_map
    Call
    Literal 2
    MakeRecord
    Kinded
func_2a([object Object])
  entry:
    FunctionRef       name: func_2b
func_2b()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "text"
    Local             name: row
    Attribute         name: key
    Literal "copy"
    Literal true
    Literal 2
    MakeRecord
    Kinded
func_2c([object Object])
  entry:
    FunctionRef       name: func_2d
func_2d()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "text"
    Local             name: row
    Attribute         name: value
    Literal "copy"
    Literal true
    Literal 2
    MakeRecord
    Kinded
func_2e([object Object])
  entry:
    Literal "key"
    Literal 0
    Local             name: it
    Index
    Literal "value"
    Literal 1
    Local             name: it
    Index
    Literal 2
    MakeRecord
func_2f()
  entry:
    Local             name: Row
    FunctionRef       name: func_30
    FunctionRef       name: func_31
    FunctionRef       name: func_33
    FunctionRef       name: func_34
    Literal 4
    MakeArray
    Literal 0
    MakeRecord
    Kinded
func_30()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "text"
    Literal "Language syntax to highlight"
    Literal 1
    MakeRecord
    Kinded
func_31()
  entry:
    Local             name: Select
    Literal 0
    MakeArray
    Literal "options"
    Literal "text"
    Literal "json"
    Literal "html"
    Literal "xml"
    Literal "javascript"
    Literal "css"
    Literal 6
    MakeArray
    Literal "value"
    Local             name: language
    Literal "onChange"
    FunctionRef       name: func_32
    Literal 3
    MakeRecord
    Kinded
func_32([object Object])
  entry:
    Local             name: newValue
    SetLocal          name: language
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_33()
  entry:
    Local             name: Text
    Literal 0
    MakeArray
    Literal "text"
    Literal "Format code (when possible)"
    Literal 1
    MakeRecord
    Kinded
func_34()
  entry:
    Local             name: Switch
    Literal 0
    MakeArray
    Literal "value"
    Local             name: doFormat
    Literal "onChange"
    FunctionRef       name: func_35
    Literal 2
    MakeRecord
    Kinded
func_35([object Object])
  entry:
    Local             name: newValue
    SetLocal          name: doFormat
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_36()
  entry:
    Local             name: Box
    ScopeEnter
    Local             name: language
    Literal "json"
    Intrinsic         operation: INTRINSIC_EQUAL
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             name: tmp_left
    JumpTrue          label: if_true_45
    Jump              label: if_false_46
  if_true_45:
    Local             name: doFormat
    Jump              label: if_end_47
  if_false_46:
    Local             name: tmp_left
    Jump              label: if_end_47
  if_end_47:
    ScopeLeave        inBlock: false, count: 2
    JumpTrue          label: if_true_48
    Jump              label: if_false_49
  if_true_48:
    ScopeEnter
    FunctionRef       name: func_37
    Literal 1
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Jump              label: if_end_50
  if_false_49:
    ScopeEnter
    FunctionRef       name: func_38
    Literal 1
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Jump              label: if_end_50
  if_end_50:
    Literal 1
    MakeArray
    Literal "scroll"
    Literal true
    Literal 1
    MakeRecord
    Kinded
func_37()
  entry:
    Local             name: Debug
    Literal 0
    MakeArray
    Literal "value"
    Local             name: responseBodyString
    Literal 1
    MakeArray
    Literal 0
    MakeRecord
    Local             name: json_parse
    Call
    Literal "force"
    Literal true
    Literal 2
    MakeRecord
    Kinded
func_38()
  entry:
    Local             name: Snippet
    Literal 0
    MakeArray
    Literal "text"
    Local             name: responseBodyString
    Literal "language"
    Local             name: language
    Literal "format"
    Local             name: doFormat
    Literal 3
    MakeRecord
    Kinded
