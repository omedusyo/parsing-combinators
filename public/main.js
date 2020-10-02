
import {
  Parser, ParserValue,
  succeed, then, first, second, map, pair,
  sequence,
  digit,
} from "../src/index";

function assert(id, b) {
  if (b === false) {
    throw Error(`Assertion Failure id = ${id}`);
  }
}

function arrayEq(xs, ys, eq=(x, y) => (x == y)) {
  if (xs.length == ys.length) {
    const n = xs.length;
    for (let i = 0; i < n; i++) {
      if (!eq(xs[i], ys[i])) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}


// === DIGIT ===
const dv0 = digit.consume("123 hi");
assert(0.0, dv0.rest == "23 hi");
assert(0.1, dv0.val == 1);
// console.log(dv0);

const dv00 = digit.consume(dv0.rest);
assert(0.2, dv00.rest == "3 hi");
assert(0.3, dv00.val == 2);
// console.log(dv00);

const dv1 = digit.consume("hi");
assert(0.4, ParserValue.hasFailed(dv1));
// console.log(dv1);

const dv2 = digit.consume("");
assert(0.5, ParserValue.hasFailed(dv2));
// console.log(dv2);


// === SUCCEED ===
const sv0 = succeed(123).consume("hi");
assert(1.0, sv0.rest == "hi");
assert(1.1, sv0.val == 123);
// console.log(sv0);

// === FIRST, SECOND ===
const fst0 = first(digit, digit).consume("12999 hi");
assert(2.0, fst0.rest == "999 hi");
assert(2.1, fst0.val == 1);

const snd0 = second(digit, digit).consume("12999 hi");
assert(2.2, snd0.rest == "999 hi");
assert(2.3, snd0.val == 2);
// console.log(th_v0);

const fst1 = first(digit, digit).consume("a2999 hi");
assert(2.4, ParserValue.hasFailed(fst1));

const snd1 = second(digit, digit).consume("a2999 hi");
assert(2.5, ParserValue.hasFailed(snd1));

const snd2 = second(digit, digit).consume("1a999 hi");
assert(2.6, ParserValue.hasFailed(snd2));

// === MAP ===
const map0 = map(digit, x => x*x).consume("5foo");
assert(3.0, map0.rest == "foo");
assert(3.1, map0.val == 25);

// === PAIR ===
const pair0 = pair(digit, digit).consume("12foo");
assert(4.0, pair0.rest == "foo");
assert(4.1, arrayEq(pair0.val, [1,2]));
// console.log(pair(digit, digit).consume("a2foo"));

// === THEN ===
const then0parser = digit.then(n => digit.map(m => n + m));
const then0 = then0parser.consume("12hi");
assert(5.0, then0.rest == "hi");
assert(5.1, then0.val == 3);

// === SEQUENCE ===
const seq0 = sequence([digit, digit, digit]).consume("123foo");
assert(6.0, seq0.rest == "foo");
assert(6.1, arrayEq(seq0.val, [1,2,3]));

const seq1 = sequence([]).consume("watev");
assert(6.2, seq1.rest == "watev");
assert(6.3, arrayEq(seq1.val, []));

