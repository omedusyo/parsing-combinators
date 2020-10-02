
# Description

TODO
parsers have very nice imperative feel

conventions:
  v, w are parse result values
  p, q, r are parsers (ps, qs, rs are array of parsers)
  s is a string
  a,b,c, x,y,z are regular values (as,bs,cs, xs,ys,zs are arrays of regular values)

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
ParserValue.succeed({val: x, rest: s})
ParserValue.fail(msg)
ParserValue.hasFailed(v)
ParserValue.hasSucceeded(v)

p.consume(s)

succeed(x)
fail(msg)

first(p, q)
second(p, q)
pair(p, q)
then(f, q)
then2(p, q, f)
then3(p, q, r, f)
then4(p1, p2, p3, p4, f)
thens(ps, f)

p.then(f)
p.then_(q)
p._then(q)

map(p, f)
p.map(f)

maximalMunch // computes the kleene star of a parser
```

