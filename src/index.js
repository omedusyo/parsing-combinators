
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
function failure(msg) {
  return { hasSuceeded: false, message: msg };
}

function hasFailed(v) {
  return !v.hasSuceeded;
}

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

// === maximalMunch ===
// TODO: is this a good name? maximalMunchAtleast0 seems too long
//       Kleene Star
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

// export munchAtleast1


// TODO: catch (think of chains of parsers that may return different kinds of messages)
// so catch should be like a switch statement

// TODO: or

// ===== HELPERS =====
// Array(a), a -> Boolean
function elemIn(xs, x) {
  return xs.indexOf(x) !== -1;
}

// String -> Bool
function isEmptyString(s) {
  return s.length == 0;
}

// === Digit ===
// Character -> Boolean
function isDigit(d) {
  return elemIn(["0","1","2","3","4","5","6","7","8","9"], d);
  // return elemIn("0123456789".split(''), d);
}
const digits2values = {
  ["0"]:0,
  ["1"]:1,
  ["2"]:2,
  ["3"]:3,
  ["4"]:4,
  ["5"]:5,
  ["6"]:6,
  ["7"]:7,
  ["8"]:8,
  ["9"]:9,
};
// digit : Parser({0,1,2,3,4,5,6,7,8,9})
export const digit = Parser(s => {
  if (isEmptyString(s)) {
    return failure("Expected a digit instead of empty string");
  } else if (isDigit(s[0])) {
    return success({val: digits2values[s[0]], rest: s.slice(1)});
  } else {
    return failure(`Expected a digit instead of '${s[0]}'`);
  }
});


