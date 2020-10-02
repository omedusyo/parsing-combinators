
# Description

TODO
parsers have very nice imperative feel

conventions:
  v, w are parse result values
  p, q, r are parsers
  s is a string
  a,b,c, x,y,z are values

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

```
p.consume(s)

succeed(x)
fail(msg)

first(p, q)
second(p, q)
then(f, q)

p.then(f)
p.then_(q)
p._then(q)

map(p, f)
p.map(f)

pair(p, q)

ParserValue.succeed({val: x, rest: s})
ParserValue.fail(msg)
ParserValue.hasFailed(v)
ParserValue.hasSucceeded(v)

digit
```

