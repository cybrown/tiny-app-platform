main()
  entry:
    Literal           0
    MakeArray
    Literal           "key"
    Literal           "title"
    Literal           "value"
    Literal           "HTTP Client demo"
    Literal           2
    MakeRecord
    Local             set_system_property
    Call
    Pop               inBlock: false
    Literal           0
    MakeArray
    DeclareLocal      name: headers, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           null
    DeclareLocal      name: body, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "text"
    DeclareLocal      name: language, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: doFormat, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           false
    DeclareLocal      name: doShowHeaders, mutable: true, hasInitialValue: true
    Pop               inBlock: false
    Literal           "GET"
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
    Local             method
    Local             url
    Local             headers
    FunctionRef       name: func_1
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_filter
    Call
    Local             body
    Literal           4
    MakeArray
    Literal           "allowErrorStatusCode"
    Literal           true
    Literal           1
    MakeRecord
    Local             http_request
    Call
    SetLocal          name: response
    Pop               inBlock: false
    Try               catchLabel: try_catch_4, endTryLabel: try_end_5
    ScopeEnter
    Literal           0
    Literal           "content-type"
    Local             response
    Attribute         name: headers
    Index
    Literal           ";"
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             string_split
    Call
    Index
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             string_trim
    Call
    DeclareLocal      name: contentType, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             contentType
    Literal           "text/html"
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_6
    Jump              if_false_7
  if_true_6:
    ScopeEnter
    Literal           "html"
    SetLocal          name: language
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_8
  if_false_7:
    Local             contentType
    Literal           "application/json"
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_9
    Jump              if_false_10
  if_true_9:
    ScopeEnter
    Literal           "json"
    SetLocal          name: language
    Pop               inBlock: false
    Literal           true
    SetLocal          name: doFormat
    ScopeLeave        inBlock: false, count: 2
    Jump              if_end_11
  if_false_10:
    Local             contentType
    Literal           "text/javascript"
    Intrinsic         INTRINSIC_EQUAL
    JumpTrue          if_true_12
    Jump              if_false_13
  if_true_12:
    ScopeEnter
    Literal           "javascript"
    SetLocal          name: language
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_14
  if_false_13:
    Literal           null
    Jump              if_end_14
  if_end_14:
    Jump              if_end_11
  if_end_11:
    Jump              if_end_8
  if_end_8:
    ScopeLeave        inBlock: false, count: 2
    TryPop
    Jump              try_end_5
  try_catch_4:
    Literal           null
    Jump              try_end_5
  try_end_5:
    Pop               inBlock: false
    Local             response
    Attribute         name: body
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             bytes_to_string
    Call
    SetLocal          name: responseBodyString
    MakeArrayForBlock count: 3
func_1(it)
  entry:
    Literal           0
    Local             it
    Index
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             tmp_left
    JumpTrue          if_true_1
    Jump              if_false_2
  if_true_1:
    Literal           1
    Local             it
    Index
    Jump              if_end_3
  if_false_2:
    Local             tmp_left
    Jump              if_end_3
  if_end_3:
    MakeArrayForBlock count: 2
func_2()
  entry:
    Local             Column
    FunctionRef       name: func_3
    Local             headers
    FunctionRef       name: func_a
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_map
    Call
    FunctionRef       name: func_15
    FunctionRef       name: func_17
    FunctionRef       name: func_19
    FunctionRef       name: func_1b
    ScopeEnter
    Local             headers
    FunctionRef       name: func_1c
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_filter
    Call
    DeclareLocal      name: validHeaders, mutable: false, hasInitialValue: true
    ScopeEnter
    Local             method
    Literal           null
    Intrinsic         INTRINSIC_NOT_EQUAL
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             tmp_left
    JumpTrue          if_true_18
    Jump              if_false_19
  if_true_18:
    Local             url
    Literal           null
    Intrinsic         INTRINSIC_NOT_EQUAL
    Jump              if_end_20
  if_false_19:
    Local             tmp_left
    Jump              if_end_20
  if_end_20:
    ScopeLeave        inBlock: false, count: 2
    JumpTrue          if_true_21
    Jump              if_false_22
  if_true_21:
    ScopeEnter
    FunctionRef       name: func_1d
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_23
  if_false_22:
    Literal           null
    Jump              if_end_23
  if_end_23:
    ScopeEnter
    Local             method
    Literal           null
    Intrinsic         INTRINSIC_NOT_EQUAL
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             tmp_left
    JumpTrue          if_true_24
    Jump              if_false_25
  if_true_24:
    Local             url
    Literal           null
    Intrinsic         INTRINSIC_NOT_EQUAL
    Jump              if_end_26
  if_false_25:
    Local             tmp_left
    Jump              if_end_26
  if_end_26:
    ScopeLeave        inBlock: false, count: 2
    JumpTrue          if_true_27
    Jump              if_false_28
  if_true_27:
    ScopeEnter
    FunctionRef       name: func_1f
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_29
  if_false_28:
    Literal           null
    Jump              if_end_29
  if_end_29:
    Literal           2
    MakeArray
    Literal           2
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Local             response
    Literal           null
    Intrinsic         INTRINSIC_NOT_EQUAL
    JumpTrue          if_true_39
    Jump              if_false_40
  if_true_39:
    ScopeEnter
    FunctionRef       name: func_20
    Literal           1
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Jump              if_end_41
  if_false_40:
    Literal           null
    Jump              if_end_41
  if_end_41:
    Literal           8
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_3()
  entry:
    Local             Row
    FunctionRef       name: func_4
    FunctionRef       name: func_7
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_4()
  entry:
    Local             Box
    FunctionRef       name: func_5
    Literal           1
    MakeArray
    Literal           "flex"
    Literal           0
    Literal           1
    MakeRecord
    Kinded
func_5()
  entry:
    Local             Select
    Literal           0
    MakeArray
    Literal           "placeholder"
    Literal           "Method"
    Literal           "options"
    Literal           "GET"
    Literal           "POST"
    Literal           "PUT"
    Literal           "PATCH"
    Literal           "DELETE"
    Literal           "LIST"
    Literal           "HEAD"
    Literal           "OPTIONS"
    Literal           8
    MakeArray
    Literal           "value"
    Local             method
    Literal           "onChange"
    FunctionRef       name: func_6
    Literal           4
    MakeRecord
    Kinded
func_6(newValue)
  entry:
    Local             newValue
    SetLocal          name: method
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_7()
  entry:
    Local             Box
    FunctionRef       name: func_8
    Literal           1
    MakeArray
    Literal           "flex"
    Literal           1
    Literal           1
    MakeRecord
    Kinded
func_8()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "placeholder"
    Literal           "URL"
    Literal           "type"
    Literal           "url"
    Literal           "onSubmit"
    Local             executeHttpRequest
    Literal           "value"
    Local             url
    Literal           "onChange"
    FunctionRef       name: func_9
    Literal           5
    MakeRecord
    Kinded
func_9(newValue)
  entry:
    Local             newValue
    SetLocal          name: url
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_a(it, index)
  entry:
    FunctionRef       name: func_b
    Literal           1
    MakeArray
func_b()
  entry:
    Local             Row
    FunctionRef       name: func_c
    FunctionRef       name: func_f
    FunctionRef       name: func_12
    Literal           3
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_c()
  entry:
    Local             Box
    FunctionRef       name: func_d
    Literal           1
    MakeArray
    Literal           "flex"
    Literal           1
    Literal           1
    MakeRecord
    Kinded
func_d()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "placeholder"
    Literal           "Header name"
    Literal           "value"
    Literal           0
    Local             it
    Index
    Literal           "onChange"
    FunctionRef       name: func_e
    Literal           3
    MakeRecord
    Kinded
func_e(newValue)
  entry:
    Literal           0
    Local             it
    Local             newValue
    SetIndex          forceRender: true
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_f()
  entry:
    Local             Box
    FunctionRef       name: func_10
    Literal           1
    MakeArray
    Literal           "flex"
    Literal           3
    Literal           1
    MakeRecord
    Kinded
func_10()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "placeholder"
    Literal           "Header value"
    Literal           "value"
    Literal           1
    Local             it
    Index
    Literal           "onChange"
    FunctionRef       name: func_11
    Literal           3
    MakeRecord
    Kinded
func_11(newValue)
  entry:
    Literal           1
    Local             it
    Local             newValue
    SetIndex          forceRender: true
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_12()
  entry:
    Local             Box
    FunctionRef       name: func_13
    Literal           1
    MakeArray
    Literal           "flex"
    Literal           0
    Literal           1
    MakeRecord
    Kinded
func_13()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Remove"
    Literal           "onClick"
    FunctionRef       name: func_14
    Literal           2
    MakeRecord
    Kinded
func_14()
  entry:
    Local             headers
    Local             index
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_remove
    Call
    SetLocal          name: headers
func_15()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "onClick"
    FunctionRef       name: func_16
    Literal           "text"
    Literal           "Add user agent header"
    Literal           2
    MakeRecord
    Kinded
func_16()
  entry:
    Local             headers
    Literal           "user-agent"
    Literal           "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
    Literal           2
    MakeArray
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_append
    Call
    SetLocal          name: headers
func_17()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "New header"
    Literal           "onClick"
    ScopeEnter
    FunctionRef       name: func_18
    ScopeLeave        inBlock: false, count: 1
    Literal           2
    MakeRecord
    Kinded
func_18()
  entry:
    Local             headers
    Literal           ""
    Literal           ""
    Literal           2
    MakeArray
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_append
    Call
    SetLocal          name: headers
func_19()
  entry:
    Local             InputText
    Literal           0
    MakeArray
    Literal           "placeholder"
    Literal           "body"
    Literal           "multiline"
    Literal           true
    Literal           "value"
    Local             body
    Literal           "onChange"
    FunctionRef       name: func_1a
    Literal           4
    MakeRecord
    Kinded
func_1a(newValue)
  entry:
    Local             newValue
    SetLocal          name: body
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_1b()
  entry:
    Local             Button
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Execute HTTP Request"
    Literal           "onClick"
    Local             executeHttpRequest
    Literal           2
    MakeRecord
    Kinded
func_1c(it)
  entry:
    Literal           0
    Local             it
    Index
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             tmp_left
    JumpTrue          if_true_15
    Jump              if_false_16
  if_true_15:
    Literal           1
    Local             it
    Index
    Jump              if_end_17
  if_false_16:
    Local             tmp_left
    Jump              if_end_17
  if_end_17:
    MakeArrayForBlock count: 2
func_1d()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "copy"
    Literal           true
    Literal           "text"
    Literal           "curl -X $method $headers '$url'"
    Literal           "method"
    Local             method
    Literal           "url"
    Local             url
    Literal           "headers"
    Local             validHeaders
    FunctionRef       name: func_1e
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_map
    Call
    Literal           " "
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_join
    Call
    Literal           3
    MakeRecord
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             string_format
    Call
    Literal           2
    MakeRecord
    Kinded
func_1e(it)
  entry:
    Literal           "-H '$name: $value'"
    Literal           "name"
    Literal           0
    Local             it
    Index
    Literal           "value"
    Literal           1
    Local             it
    Index
    Literal           2
    MakeRecord
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             string_format
    Call
func_1f()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "copy"
    Literal           true
    Literal           "text"
    Literal           "http_request(method: \"$method\", url: \"$url\" $headers $body)"
    Literal           "method"
    Local             method
    Literal           "url"
    Local             url
    Literal           "body"
    ScopeEnter
    Local             body
    Literal           null
    Intrinsic         INTRINSIC_NOT_EQUAL
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             tmp_left
    JumpTrue          if_true_30
    Jump              if_false_31
  if_true_30:
    Local             body
    Literal           ""
    Intrinsic         INTRINSIC_NOT_EQUAL
    Jump              if_end_32
  if_false_31:
    Local             tmp_left
    Jump              if_end_32
  if_end_32:
    ScopeLeave        inBlock: false, count: 2
    JumpTrue          if_true_33
    Jump              if_false_34
  if_true_33:
    ScopeEnter
    Literal           ", body: \""
    Local             body
    Intrinsic         INTRINSIC_ADD
    Literal           "\""
    Intrinsic         INTRINSIC_ADD
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_35
  if_false_34:
    ScopeEnter
    Literal           " "
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_35
  if_end_35:
    Literal           "headers"
    Local             validHeaders
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             array_length
    Call
    Literal           0
    Intrinsic         INTRINSIC_GREATER
    JumpTrue          if_true_36
    Jump              if_false_37
  if_true_36:
    ScopeEnter
    Literal           ", headers:"
    Local             validHeaders
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             json_stringify
    Call
    Intrinsic         INTRINSIC_ADD
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_38
  if_false_37:
    ScopeEnter
    Literal           " "
    ScopeLeave        inBlock: false, count: 1
    Jump              if_end_38
  if_end_38:
    Literal           4
    MakeRecord
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             string_format
    Call
    Literal           2
    MakeRecord
    Kinded
func_20()
  entry:
    Local             Column
    FunctionRef       name: func_21
    FunctionRef       name: func_23
    Local             doShowHeaders
    JumpTrue          if_true_42
    Jump              if_false_43
  if_true_42:
    ScopeEnter
    FunctionRef       name: func_27
    Literal           1
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Jump              if_end_44
  if_false_43:
    Literal           null
    Jump              if_end_44
  if_end_44:
    FunctionRef       name: func_2f
    FunctionRef       name: func_36
    Literal           5
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_21()
  entry:
    Local             Row
    FunctionRef       name: func_22
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_22()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Status code: $status"
    Literal           "status"
    Local             response
    Attribute         name: status
    Literal           1
    MakeRecord
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             string_format
    Call
    Literal           1
    MakeRecord
    Kinded
func_23()
  entry:
    Local             Row
    FunctionRef       name: func_24
    FunctionRef       name: func_25
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_24()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Show headers"
    Literal           1
    MakeRecord
    Kinded
func_25()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "value"
    Local             doShowHeaders
    Literal           "onChange"
    FunctionRef       name: func_26
    Literal           2
    MakeRecord
    Kinded
func_26(newValue)
  entry:
    Local             newValue
    SetLocal          name: doShowHeaders
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_27()
  entry:
    Local             Column
    FunctionRef       name: func_28
    FunctionRef       name: func_29
    Literal           2
    MakeArray
    Literal           "flexShrink"
    Literal           0
    Literal           1
    MakeRecord
    Kinded
func_28()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Headers:"
    Literal           1
    MakeRecord
    Kinded
func_29()
  entry:
    Local             Table
    Literal           0
    MakeArray
    Literal           "columns"
    Literal           "description"
    Literal           "Name"
    Literal           "display"
    FunctionRef       name: func_2a
    Literal           2
    MakeRecord
    Literal           "description"
    Literal           "Value"
    Literal           "display"
    FunctionRef       name: func_2c
    Literal           2
    MakeRecord
    Literal           2
    MakeArray
    Literal           "values"
    Local             response
    Attribute         name: headers
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             object_entries
    Call
    FunctionRef       name: func_2e
    Literal           2
    MakeArray
    Literal           0
    MakeRecord
    Local             array_map
    Call
    Literal           2
    MakeRecord
    Kinded
func_2a(row)
  entry:
    FunctionRef       name: func_2b
func_2b()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Local             row
    Attribute         name: key
    Literal           "copy"
    Literal           true
    Literal           2
    MakeRecord
    Kinded
func_2c(row)
  entry:
    FunctionRef       name: func_2d
func_2d()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Local             row
    Attribute         name: value
    Literal           "copy"
    Literal           true
    Literal           2
    MakeRecord
    Kinded
func_2e(it)
  entry:
    Literal           "key"
    Literal           0
    Local             it
    Index
    Literal           "value"
    Literal           1
    Local             it
    Index
    Literal           2
    MakeRecord
func_2f()
  entry:
    Local             Row
    FunctionRef       name: func_30
    FunctionRef       name: func_31
    FunctionRef       name: func_33
    FunctionRef       name: func_34
    Literal           4
    MakeArray
    Literal           0
    MakeRecord
    Kinded
func_30()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Language syntax to highlight"
    Literal           1
    MakeRecord
    Kinded
func_31()
  entry:
    Local             Select
    Literal           0
    MakeArray
    Literal           "options"
    Literal           "text"
    Literal           "json"
    Literal           "html"
    Literal           "xml"
    Literal           "javascript"
    Literal           "css"
    Literal           6
    MakeArray
    Literal           "value"
    Local             language
    Literal           "onChange"
    FunctionRef       name: func_32
    Literal           3
    MakeRecord
    Kinded
func_32(newValue)
  entry:
    Local             newValue
    SetLocal          name: language
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_33()
  entry:
    Local             Text
    Literal           0
    MakeArray
    Literal           "text"
    Literal           "Format code (when possible)"
    Literal           1
    MakeRecord
    Kinded
func_34()
  entry:
    Local             Switch
    Literal           0
    MakeArray
    Literal           "value"
    Local             doFormat
    Literal           "onChange"
    FunctionRef       name: func_35
    Literal           2
    MakeRecord
    Kinded
func_35(newValue)
  entry:
    Local             newValue
    SetLocal          name: doFormat
    Pop               inBlock: true
    CtxRender
    MakeArrayForBlock count: 2
func_36()
  entry:
    Local             Box
    ScopeEnter
    Local             language
    Literal           "json"
    Intrinsic         INTRINSIC_EQUAL
    DeclareLocal      name: tmp_left, mutable: false, hasInitialValue: true
    Pop               inBlock: false
    Local             tmp_left
    JumpTrue          if_true_45
    Jump              if_false_46
  if_true_45:
    Local             doFormat
    Jump              if_end_47
  if_false_46:
    Local             tmp_left
    Jump              if_end_47
  if_end_47:
    ScopeLeave        inBlock: false, count: 2
    JumpTrue          if_true_48
    Jump              if_false_49
  if_true_48:
    ScopeEnter
    FunctionRef       name: func_37
    Literal           1
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Jump              if_end_50
  if_false_49:
    ScopeEnter
    FunctionRef       name: func_38
    Literal           1
    MakeArray
    ScopeLeave        inBlock: true, count: 1
    Jump              if_end_50
  if_end_50:
    Literal           1
    MakeArray
    Literal           "scroll"
    Literal           true
    Literal           1
    MakeRecord
    Kinded
func_37()
  entry:
    Local             Debug
    Literal           0
    MakeArray
    Literal           "value"
    Local             responseBodyString
    Literal           1
    MakeArray
    Literal           0
    MakeRecord
    Local             json_parse
    Call
    Literal           "force"
    Literal           true
    Literal           2
    MakeRecord
    Kinded
func_38()
  entry:
    Local             Snippet
    Literal           0
    MakeArray
    Literal           "text"
    Local             responseBodyString
    Literal           "language"
    Local             language
    Literal           "format"
    Local             doFormat
    Literal           3
    MakeRecord
    Kinded
