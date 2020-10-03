
// =========== CORE =============
// A parser p of type A - written p : Parser(A) - is basically a function
//   p : String -> (A, String) + B
// such that it consumes a part of a string s : String to produce both
// a value of type A and the rest of the string that was not consumed.
// In this process of consumption it may not like what it sees and fail with a value of type B
//
// For example take the
//   Num : Parser(Number)
// that consumes

// ====== PARSING RESULT VALUES ======
// E -> Failure(E)
function failure(msg) {
  return { hasSuceeded: false, message: msg };
}

function hasFailed(v) {
  return !v.hasSuceeded;
}

// { rest: String, val: A } -> Success(A)
function success({rest, val}) {
  return { hasSuceeded: true, rest, val };
}

function hasSucceeded(v) {
  return v.hasSuceeded;
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
}
// (String -> (Success(A) + Failure(E))) -> Parser(A)
export function Parser(f) {
  return new _Parser(f);
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
      return success({val: [v.val, w.val], rest: w.rest});
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

// === THEN2, THEN3, THEN4 ===
//
// Parser(A), Parser(B), (A, B -> C) -> Parser(C)
export const then2 = (p, q, f) => pair(p, q).map(([x, y]) => f(x, y));
// Parser(A), Parser(B), Parser(C), (A, B, C -> D) -> Parser(D)
export const then3 = (p, q, r, f) => sequence([p, q, r]).map(([x, y, z]) => f(x, y, z));
// Parser(A1), Parser(A2), Parser(A3), Parser(A4), (A1, A2, A3, A4 -> B) -> Parser(B)
export const then4 = (p1, p2, p3, p4, f) => sequence([p1, p2, p3, p4]).map(([x1, x2, x3, x4]) => f(x1, x2, x3, x4));

// Array(Parser(A)), (Array(A) -> B) -> Parser(B)
export const thens = (ps, f) => sequence(ps).map(f);


// ===== ADVANCED (POSSIBLE PARALLEL (?) OR NON-TERMINATING) STRUCTURE =====
// TODO: add bounded munches... i.e. apply a parser atmost n-times, and if it doesn't fail by n-th try, we fail

// === maximalMunch ===
// TODO: is this a good name? maximalMunchAtleast0 seems too long
//       kleeneStar maybe? or just star...
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

// === TRY2 ===
// TODO: this seems to "backtrack"
// TODO: maybe rename this to parallel or?
// Parser(E1; A), Parser(E2; A) -> Parser(E1 + E2; A)
export function try2(p, q) {
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
// TODO: god-damn it, try is a reserved keyword
export function tryAll(ps) {
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

// TODO: catch (think of chains of parsers that may fail with different kinds of messages)
// so catch should be like a switch (case) statement
//
// or some sort of analogue of if-then-else?

// sequential or
// TODO: seqor
//
// sequential try
// or any?

