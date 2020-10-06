
// =========== CORE =============
// A parser p of type A - written p : Parser(A) - is basically a function
//   p : String -> (A, String) + E
// such that it consumes a part of a string s : String to produce both
// a value of type A and the rest of the string that was not consumed.
// In this process of consumption it may not like what it sees and fail with an error value of type E
//
// For example take the
//   Num : Parser(Number)
// that consumes

// ====== PARSING RESULT VALUES ======
// E -> Failure(E)
function failure(msg) {
  return { hasSucceeded: false, message: msg };
}

function hasFailed(v) {
  return !v.hasSucceeded;
}

// { rest: String, val: A } -> Success(A)
function success({rest, val}) {
  return { hasSucceeded: true, rest, val };
}

function hasSucceeded(v) {
  return v.hasSucceeded;
}

export const ParserValue = {
  failure,
  hasFailed,
  success,
  hasSucceeded
};

// ===== PARSERS =====
class _Parser {
  constructor(f) {
    this._f = f;
  }
  consume(s) {
    return this._f(s);
  }
  then(f) {
    return then(this, f);
  }
  _then(q) {
    return second(this, q);
  }
  then_(q) {
    return first(this, q);
  }
  map(f) {
    return map(this, f);
  }
  catch(f) {
    return ifFails(this, f);
  }
  setError(e) {
    return setError(this, e);
  }
  mapError(f) {
    return mapError(this, f);
  }
}
// (String -> (Success(A) + Failure(E))) -> Parser(A)
export function Parser(f) {
  return new _Parser(f);
}

// Use this for recursive definitions
export function Rec(f) {
  return Parser(s => 
    f().consume(s)
  );
}
// ======== PARSING COMBINATORS =========

// ===== BASIC MONAD STRUCTURE =====

// === SUCEED ===
// This is the unit of the parsing monad
// A -> Parse(A)
export function succeed(a) {
  return Parser(s => success({rest: s, val: a}));
}

// === FAIL ===
// This constructs a parser that always fails with message := msg
export function fail(msg) {
  return Parser(_ => failure(msg));
}

// === THEN ===
// This is the bind of the parsing monad
// Use
//   p.then(f)
// instead.
//
// Parser(A), (A -> Parser(B)) -> Parser(B)
export function then(p, f) {
  return Parser(s => {
    const v = p.consume(s);
    if (hasSucceeded(v)) {
      return f(v.val).consume(v.rest);
    } else {
      return v; // p failed at consuming f
    }
  });
}

// === SECOND ===
// Parser(A), Parser(B) -> Parser(B)
export function second(p, q) {
  return Parser(s => {
    const v = p.consume(s);
    if (hasSucceeded(v)) {
      return q.consume(v.rest);
    } else {
      return v;
    }
  });
}

// === FIRST ===
// Parser(A), Parser(B) -> Parser(B)
export function first(p, q) {
  return Parser(s => {
    const v = p.consume(s);
    if (hasSucceeded(v)) {
      const w = q.consume(v.rest);
      if (hasSucceeded(w)) {
        return success({ val: v.val, rest: w.rest });
      } else {
        return w;
      }
    } else {
      return v;
    }
  });
}

// === MAP ===
// Parser(A), (A -> B) -> Parser(B)
export function map(p, f) {
  return Parser(s => {
    const v = p.consume(s);
    if (hasSucceeded(v)) {
      return success({val: f(v.val), rest: v.rest});
    } else {
      return v;
    }
  });
}

// === PAIR ===
// first p consumes, then q consumes - order is important!
// if both succeed - one after the other - both parsed values will be returned
//
// Parser(A), Parser(B) -> Parser([A, B]) // [A, B] is the cartesian product
export function pair(p, q) {
  return Parser(s => {
    const v = p.consume(s);
    if (hasSucceeded(v)) {
      const w = q.consume(v.rest);
      if (hasSucceeded(w)) {
        return success({val: [v.val, w.val], rest: w.rest});
      } else {
        return w;
      }
    } else {
      return v;
    }
  });
}

// === SEQUENCE ===
// Array(Parser(A)) -> Parser(Array(A))
export function sequence(ps) {
  return Parser(s => {
    let xs = [];
    let v;
    for (let i = 0; i < ps.length; i++) {
      v = ps[i].consume(s);
      if (hasSucceeded(v)) {
        s = v.rest;
        xs.push(v.val);
      } else {
        return v;
      }
    }
    return success({val: xs, rest: s});
  });
}

// === MAP2, MAPS ===
//
// Parser(A), Parser(B), (A, B -> C) -> Parser(C)
export const map2 = (p, q, f) => pair(p, q).map(([x, y]) => f(x, y));
// Array(Parser(A)), (Array(A) -> B) -> Parser(B)
export const maps = (ps, f) => sequence(ps).map(f);

// ==== THEN2, THENS ===
// Parser(A), Parser(B), (A, B -> Parser(C)) -> Parser(C)
export const then2 = (p, q, f) => pair(p, q).then(([x, y]) => f(x, y));
// Array(Parser(A)), (Array(A) -> Parser(B)) -> Parser(B)
export const thens = (ps, f) => sequence(ps).then(f);


// ===== ADVANCED (POSSIBLY PARALLEL (?) OR NON-TERMINATING) STRUCTURE =====
// TODO: add bounded munches... i.e. apply a parser atmost n-times, and if it doesn't fail by n-th try, we fail

// === maximalMunch ===
// TODO: is this a good name?
//       kleeneStar maybe? or just star...
//
// Applies a parser repeatedly and collects it's values into an array
// until the parserfails, then it succeeds with the collected values
// this will either always suceed or loop
// Parser(A) -> Parser(Array(A))
export function maximalMunch(p) {
  return Parser(s => {
    let hasSucceededSoFar = true;
    const xs = [];
    while (hasSucceededSoFar) {
      const v = p.consume(s);
      if (hasSucceeded(v)) {
        xs.push(v.val);
        s = v.rest;
      } else {
        hasSucceededSoFar = false;
      }
    }
    return success({val: xs, rest: s});
  });
}

export function maximalMunch1(p) {
  return pair(p, maximalMunch(p)).map(([x, xs]) => [x, ...xs]);
}


// like maximalMunch, but doesn't keep track of values in an array
// Parser(A) -> Parser({undefined})
export function maximalMunchDiscard(p) {
  return Parser(s => {
    let hasSucceededSoFar = true;
    while (hasSucceededSoFar) {
      const v = p.consume(s);
      if (hasSucceeded(v)) {
        s = v.rest;
      } else {
        hasSucceededSoFar = false;
      }
    }
    return success({val: undefined, rest: s});
  });
}

// Let S be the type of your state values (also called accumulator values?);.
// Think of A as the type of your actions on your state.
// Then
//   p : Parser(A)
//   initState : S
//   f : S, A -> S  // this is the JS convention of Array.prototype.reduce
// so
//   maximalReduce(p, initState, f) : Parser(S)
//
// It repeatedly applies p until it fails.
// During this repetition we'll generate a stream of values
//   a1, a2, a3, ...
// and we'll apply these values to the initial state to get the stream
//   s1 := initState,
//   s2 := f(s1, a1),
//   s3 := f(s2, a2),
//   ...
// and when p succeeds with the last an, we succeed with s(n+1)
export function maximalReduce(p, initState, f) {
  return Parser(s => {
    let hasSucceededSoFar = true;
    let state = initState;
    while (hasSucceededSoFar) {
      const v = p.consume(s);
      if (hasSucceeded(v)) {
        state = f(state, v.val);
        s = v.rest;
      } else {
        hasSucceededSoFar = false;
      }
    }
    return success({val: state, rest: s});
  });
}

// === OR ===
// TODO: this seems to "backtrack"
// TODO: maybe rename this to parallel or?
// Parser(E1; A), Parser(E2; A) -> Parser(E1 + E2; A)
export function or(p, q) {
  return Parser(s => {
    const v = p.consume(s);
    if (hasSucceeded(v)) {
      return v;
    } else {
      const w = q.consume(s); // note that this is again s and not v.rest
      if (hasSucceeded(w)) {
        return w;
      } else {
        return failure([v.message, w.message]);
      }
    }
  });
}

// Array(Parser(E; A)) -> Parser(Array(E); A)
export function any(ps) {
  return Parser(s => {
    const errors = [];
    for (let i = 0; i < ps.length; i++) {
      const v = ps[i].consume(s);
      if (hasSucceeded(v)) {
        return v;
      } else {
        errors.push(v.message);
      }
    }
    return failure(errors);
  });
}

// === ifFails ===
// use p.catch(f)
//
// this is like an analogue of then but for errors
// Parser(E1; A), (E1 -> Parser(E2; A)) -> Parser(E2; A)
export function ifFails(p, f) {
  return Parser(s => {
    const v = p.consume(s);
    if (hasSucceeded(v)) {
      return v;
    } else {
      return f(p.message).consume(s);
    }
  });
}

// use p.setError(e)
// this is like the unit, but for the errors
// Parser(E1; A), E2 -> Parser(E2; A)
export function setError(p, e) {
  return Parser(s => {
    const v = p.consume(s);
    if (hasSucceeded(v)) {
      return v;
    } else {
      return failure(e);
    }
  });
}

// use p.mapError(f)
// this is like the map, but for the errors
// Parser(E1; A), (E1 -> E2) -> Parser(E2; A)
export function mapError(p, f) {
  return Parser(s => {
    const v = p.consume(s);
    if (hasSucceeded(v)) {
      return v;
    } else {
      return failure(f(v.message));
    }
  });
}


// ========== SPECIALIZED PARSERS ============
// ===== HELPERS =====
// Array(a), a -> Boolean
function elemIn(xs, x) {
  return xs.indexOf(x) !== -1;
}

// String -> Bool
function isEmptyString(s) {
  return s.length === 0;
}

function codeOfChar(c) {
  return c.charCodeAt(0);
}

const charCode0 = codeOfChar("0")
const charCode9 = codeOfChar("9")

function isDigit(c) {
  const code = codeOfChar(c);
  return charCode0 <= code && code <= charCode9;
}

// (Char -> Bool) -> Parser(Char)
export function satisfies(predicate) {
  return Parser(s => {
    if (isEmptyString(s)) {
      return failure(undefined);
    } else if (predicate(s[0])) {
      return success({val: s[0], rest: s.slice(1)});
    } else {
      return failure(s[0]);
    }
  });
}

// Char -> Parser(Char)
export function char(c0) {
  return satisfies(c => c === c0);
}

// Parser({0, 1, ..., 9})
export const digit = satisfies(isDigit);

// Array(Char) -> Parser(Char)
export function oneOf(xs) {
  return satisfies(c => elemIn(xs, c));
}

// String -> Parser(String)
export function string(s) {
  // "foo"
  // ~~split~~> ["f","o","o"]
  // ~~map~~> [char("f"), char("o"), char("o")]
  // ~~maps~~> ...
  const characters = s.split("");
  return maps(characters.map(char), xs => xs.join(""));
}

// === end ===
// Parser({""})
export const end = Parser(s => {
  if (s === "") {
    return success({val: "", rest: s});
  } else {
    return failure(s);
  }
});

