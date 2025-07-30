# Todo list

## Platform
 [ ] ( ) On error popups, add a button to open editor and put cursor on the correct line

## Stdlib
 [ ] ( ) Add an option to regexp_find (and _global) to return the first capture group instead (maybe --capture ?)
 [ ] ( ) Add humanize formater (SI decimal scale, SI binary scale, file size, time relative, duration, ...)
 [ ] ( ) Rich stdlib for dicts
 [ ] ( ) Rework stdlib for records
 [ ] ( ) Allow most collection functions to use null and infer it as an empty collection

## Editor
 [x] ( ) Show type errors directly in editor
 [ ] ( ) Show type of symbol under mouse pointer
 [ ] ( ) Autocomplete expression at current cursor position
 [ ] ( ) Avoid close editor when pressing Escape to close code mirror search box
 [ ] ( ) Have a search feature with monaco editor
 [ ] ( ) Go to symbol definition with Ctrl + click in editor
 [ ] ( ) Remove or rework type error list
 [ ] ( ) Automatic typecheck

## Type Checking

### General
 [ ] (S) Type all existing stdlib functions
 [x] (S) Investigate proper | syntax for unions
 [x] (S) Allow () in type expressions
 [x] (S) Allow parsing of any identifier as type name, instead of list. For non intrinsic type, it would be a type alias
 [x] (A) Add a dict type
            Like a record, but can have many keys and all values are the same type.
            Wait for generics ?
 [x] (S) Allow use function inside another function before definition
            Exemple: A calls B, then B is defined
 [x] (A) Allow assign more addressable values than local variables
            Assign array index, record field
            Assign dict when available

### Generics
 [x] (A) Investigate how to model function like array_map
 [ ] (A) Refactor array and dict types to use generics
            Depends on generics to be implemented
 [ ] (S) Allow positional type arguments #bug

### Kinded objects
 [x] (S) Type check kinded object attributes
 [x] (S) Type check kinded object children
            Allow multiple items if children is an array.
            Do not allow items if children is not defined.
 [x] ( ) Type check kinded object value, must be a function or a predefined widget
 [ ] ( ) Make sure predefined windgets can't be used as standard functions

### Type system fundamentals
 [x] (B) Type alias / Named types
 [ ] ( ) Intersection type
            Only between records
            Do not accept same field with different type yet
 [ ] ( ) Investigate recursive types
            Depends on type alias ?
 [ ] ( ) Investigate how to discriminate against union types.
            Example: remove null from union type
            Use switch expression ?
            Use if expression ?
            Create special syntax ?
 [ ] ( ) `never` type, use this type in blocks to determinate of the next expressions are ever executed
            Allows for dead code detection
            Use it to type check return and throw expressions as never
 [ ] ( ) `opaque`type that takes a name as parameter to represent resources used by native functions
            such as cheerio. The name would be used to prevent each opaque type kind to be assigned to each other

### Functions
 [ ] ( ) Make type system aware of only named parameters
            Only named parameters should not be considered for positional parameters
 [ ] ( ) Support varargs functions

### Modules
 [ ] ( ) Type import statements
            Investigate how to get a source file during type checking phase
            Make two different statements ?
                - Import a file
                - Import a dynamic library
