Add humanize formater (SI decimal scale, SI binary scale, file size, time relative, duration, ...)

## Stdlib
 [ ] Add an option to regexp_find (and _global) to return the first capture group instead (maybe --capture ?)

## Type Checking

### General
 [ ] (S) Type all existing stdlib functions
 [x] (S) Investigate proper | syntax for unions
 [x] (S) Allow () in type expressions
 [x] (S) Allow parsing of any identifier as type name, instead of list. For non intrinsic type, it would be a type alias
 [ ] (A) Add a dict type
            Like a record, but can have many keys and all values are the same type.
            Wait for generics ?

### Generics
 [x] (A) Investigate how to model function like array_map
 [ ] (A) Refactor array and dict types to use generics
            Depends on generics to be implemented
 [ ] (S) Allow positional type arguments #bug

### Kinded objects
 [ ] (S) Type check kinded object attributes
 [ ] (S) Type check kinded object children
            Allow multiple items if children is an array.
            Do not allow items if children is not defined.
 [ ] ( ) Type check kinded object value, must be a function or a predefined widget

### Type system fundamentals
 [x] (B) Type alias / Named types
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

### Functions
 [ ] ( ) Make type system aware of only named parameters
            Only named parameters should not be considered for positional parameters

### Modules
 [ ] ( ) Type import statements
            Investigate how to get a source file during type checking phase
            Make two different statements ?
                - Import a file
                - Import a dynamic library
