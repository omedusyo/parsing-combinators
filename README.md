
# Description
Compositional Parsers Library
TODO: conceptually we don't parse finite strings -
      it's better to think of it as infinite stream of characters (tokens).

TODO
parsers have very nice imperative feel

Rec, maximalMunch1


# Installation
```
npm install https://github.com/omedusyo/parsing-combinators.git
```

# Usage
TODO
```
import P from "parsing-combinators";
```

# Interface

## Conventions
  `v, w` are parse result values
  `p, q, r` are parsers (`ps, qs, rs` are array of parsers)
  `s` is a string
  `a,b,c, x,y,z` are regular values (`as,bs,cs, xs,ys,zs` are arrays of regular values)

Let `A` be the type of a regular value, `E` the error type. Then
  `Parser(E; A)`
is the type of parsers with results in `A` and errors in `E`.
We usually omit the error type.
If in a type signature of a combinator we have multiple occurrences of types of shape `Parser(_)` and the error type is omitted, then we may assume that the error type in all the occurrences is the same `E`.

## Parser Values
```
ParserValue.succeed({val: x, rest: s})
ParserValue.fail(msg)
ParserValue.hasFailed(v)
ParserValue.hasSucceeded(v)
```
For `v` a success parser value
```
v.rest
v.val 
```

For `v` a failure
```
v.message
```

```
hasFailed : ParserValue(A) -> Bool
hasFailed(v)
```

```
hasSucceeded : ParserValue(A) -> Bool
hasSucceeded(v)
```

## Basic Parsers and Parser Combinators
### `Parser` constructor
```
Parser : (String -> ParserValue(A)) -> Parser(A)
```

### .consume
Assuming `p : Parser(A)`

```
p.consume(s) : ParserValue(A)
```
### succeed (unit of the monad), fail
```
succeed : A -> Parser(A)
succeed(x)
```
```
fail : E -> Parser(E; A)
fail(msg)
```
### then (the bind of the monad) and its multiargument variations
```
then : Parser(A), (A -> Parser(B)) -> Parser(B)
then(p, f)
p.then(f)
```
```
then2: Parser(A), Parser(B), (A, B -> Parser(C)) -> Parser(C)
then2(p, q, f)
```
```
thens : Array(Parser(A)), (Array(A) -> Parser(B)) -> Parser(B)
thens(ps, f)
```

### Functor Structure and its multiargument variations
```
map : Parser(A), (A -> B) -> Parser(B)
map(p, f)
p.map(f)
```

```
map2 : Parser(A), Parser(B), (A, B -> C) -> Parser(C)
map2(p, q, f)
```

```
maps : Array(Parser(A)), (Array(A) -> B) -> Parser(B)
maps(ps, f)
```

### Cartesian Structure
```
first : Parser(A), Parser(B) -> Parser(B)
first(p, q)
p.then_(q)
```

```
second : Parser(A), Parser(B) -> Parser(B)
second(p, q)
p._then(q)
```

```
pair : Pair(A), Pair(B) -> Pair([A, B])
pair(p, q)
```

`repeat` is basically an analogue of the for loop as opposed to the while loop
i.e. ahead of time bounded iteration as opposed to unbounded iteration.
Also denoted `p^n` (`n`-th power of `p`)
```
repeat : Parser(A), Nat -> Parser(Array(n; A))
repeat(p, n)
```

```
sequence : Array(Parser(A)) -> Parser(Array(A))
sequence(ps)
```



### Choice Structure
```
or : Parser(E1; A), Parser(E2; A) -> Parser(E1 + E2; A)
or(p, q)
```

```
any : Array(Parser(E; A)) -> Parser(Array(E); A)
any(ps)
```

```
ifFails : Parser(E1; A), (E1 -> Parser(E2; A)) -> Parser(E2; A)
ifFails(p, f)
p.catch(f)
```

```
setError : Parser(E1; A), E2 -> Parser(E2; A)
setError(p, e)
p.setError(e)
```

```
mapError : Parser(E1; A), (E1 -> E2) -> Parser(E2; A)
mapError(p, f)
p.mapError(f)
```
### Kleene Star Structure
Computes variations of the kleene star of a parser.

```
maximalMunch : Parser(A) -> Parser(Array(A))
maximalMunch(p) 
```

like maximalMunch, but doesn't keep track of values in an array
```
maximalMunchDiscard : Parser(A) -> Parser({undefined})
maximalMunchDiscard(p)
```

Let S be the type of your state values (also called accumulator values?);.
Think of A as the type of your actions on your state.
Then
  `p : Parser(A)`
   `initState : S`
   `f : S, A -> S  // this is the JS convention of Array.prototype.reduce`
so
  `maximalReduce(p, initState, f) : Parser(S)`                                                                           
It repeatedly applies p until it fails.
During this repetition we'll generate a stream of values
 `a1, a2, a3, ...`
and we'll apply these values to the initial state to get the stream
  `s1 := initState,`
  `s2 := f(s1, a1),`
  `s3 := f(s2, a2),`
  `...`
and when p succeeds with the last an, we succeed with s(n+1)

```
maximalReduce : Parser(A), S, (S, A -> S) -> Parser(S)
maximalReduce(p, initState, f)
```
### Specialized Structure
```
satisfies : (Char -> Bool) -> Parser(Char)
satisfies(test)
```

```
char : Char -> Parser(Char)
char(c)
```

```
digit : Parser({0, 1, ..., 9})
```

```
string : String -> Parser(String)
string(s)
```
```
end : Parser({""})
```

take(3) consumes first 3 characters of the input string, and returns them as the result
in case the input string is less than 3 characters, it fails with the length of the input string
```
take : Nat -> Parser(String)
take(N)
```

