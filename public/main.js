
import {
  ParserValue,
  succeed, then, first, second, map, pair,
  sequence, then2, thens,
  maximalMunch, maximalReduce, maximalMunchDiscard,
  try2, tryAll
} from "../src/index";

import { digit } from "./example0_digits";
import { cCharacter } from "./example1_letters";

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
assert("digit:0", dv0.rest == "23 hi");
assert("digit:1", dv0.val == 1);
// console.log(dv0);

const dv00 = digit.consume(dv0.rest);
assert("digit:2", dv00.rest == "3 hi");
assert("digit:3", dv00.val == 2);
// console.log(dv00);

const dv1 = digit.consume("hi");
assert("digit:4", ParserValue.hasFailed(dv1));
// console.log(dv1);

const dv2 = digit.consume("");
assert("digit:5", ParserValue.hasFailed(dv2));
// console.log(dv2);


// === SUCCEED ===
const sv0 = succeed(123).consume("hi");
assert("succeed:0", sv0.rest == "hi");
assert("succeed:1", sv0.val == 123);
// console.log(sv0);

// === FIRST, SECOND ===
const fst0 = first(digit, digit).consume("12999 hi");
assert("first:0", fst0.rest == "999 hi");
assert("first:1", fst0.val == 1);

const snd0 = second(digit, digit).consume("12999 hi");
assert("second:0", snd0.rest == "999 hi");
assert("second:1", snd0.val == 2);
// console.log(th_v0);

const fst1 = first(digit, digit).consume("a2999 hi");
assert("first:2", ParserValue.hasFailed(fst1));

const snd1 = second(digit, digit).consume("a2999 hi");
assert("second:2", ParserValue.hasFailed(snd1));

const snd2 = second(digit, digit).consume("1a999 hi");
assert("second:3", ParserValue.hasFailed(snd2));

// === MAP ===
const map0 = map(digit, x => x*x).consume("5foo");
assert("map:0", map0.rest == "foo");
assert("map:1", map0.val == 25);

const map1 = map(digit, x => x*x).consume("foo");
assert("map:2", ParserValue.hasFailed(map1));

// === PAIR ===
const pair0 = pair(digit, digit).consume("12foo");
assert("pair:0", pair0.rest == "foo");
assert("pair:1", arrayEq(pair0.val, [1,2]));
// console.log(pair(digit, digit).consume("a2foo"));

// === THEN ===
const then0parser = digit.then(n => digit.map(m => n + m));
const then0 = then0parser.consume("12hi");
assert("then:0", then0.rest == "hi");
assert("then:1", then0.val == 3);

// === SEQUENCE ===
const seq0 = sequence([digit, digit, digit]).consume("123foo");
assert("sequence:0", seq0.rest == "foo");
assert("sequence:1", arrayEq(seq0.val, [1,2,3]));

const seq1 = sequence([]).consume("watev");
assert("sequence:2", seq1.rest == "watev");
assert("sequence:3", arrayEq(seq1.val, []));

// === THEN2 ===
const then2_0 = then2(digit, digit, (x, y) => x + y).consume("45foo");
assert("then2:0", then2_0.rest == "foo");
assert("then2:1", then2_0.val === 4 + 5);

// === THENS ===
const sum = xs => xs.reduce((x, y) => x + y, 0);
const thens0 = thens([digit,digit,digit,digit,digit], sum).consume("12345foo");
// console.log(thens0);
assert("thens:0", thens0.rest == "foo");
assert("thens:1", thens0.val === 1 + 2 + 3 + 4 + 5);

// === maximalMunch ===
const max0 = maximalMunch(digit).consume("1234foo");
assert("maximalMunch:0", max0.rest == "foo");
assert("maximalMunch:1", arrayEq(max0.val, [1,2,3,4]));

const max1 = maximalMunch(digit).consume("foo");
assert("maximalMunch:2", max1.rest == "foo");
assert("maximalMunch:3", arrayEq(max1.val, []));

// === maximalMunchDiscard ===
const maxd0 = maximalMunchDiscard(digit).consume("1234foo");
assert("maximalMunchDiscard:0", maxd0.rest == "foo");
assert("maximalMunchDiscard:1", maxd0.val === undefined);

const maxd1 = maximalMunchDiscard(digit).consume("foo");
assert("maximalMunchDiscard:2", maxd1.rest == "foo");
assert("maximalMunchDiscard:3", maxd1.val === undefined);

// === maximalReduce ===
const maxred0 = maximalReduce(digit, 0, (x, y) => x + y).consume("12345foo");
// console.log(maxred0);
assert("maximalReduce:0", maxred0.rest == "foo");
assert("maximalReduce:1", maxred0.val == 1 + 2 + 3 + 4 + 5);

const maxred1 = maximalReduce(digit, 0, (x, y) => x + y).consume("foo");
assert("maximalReduce:2", maxred1.rest == "foo");
assert("maximalReduce:3", maxred1.val === 0);

// === cCharacter ===
const cchar0 = cCharacter.consume("c123");
// console.log(cchar0);
assert("cCharacter:0", cchar0.rest == "123");
assert("cCharacter:1", cchar0.val === "c");

const cchar1 = cCharacter.consume("123");
// console.log(cchar1);
assert("cCharacter:2", ParserValue.hasFailed(cchar1));

const cchar2 = cCharacter.consume("");
// console.log(cchar2);
assert("cCharacter:3", ParserValue.hasFailed(cchar2));

// === try2 ===
const try2_0 = try2(digit, digit).consume("29foo");
assert("try2:0", try2_0.rest == "9foo");
assert("try2:1", try2_0.val === 2);

const try2_1 = try2(digit, cCharacter).consume("cxxx");
assert("try2:2", try2_1.rest == "xxx");
assert("try2:3", try2_1.val === "c");

const try2_2 = try2(digit, cCharacter).consume("xxxx");
// console.log(try2_2);
assert("try2:4", ParserValue.hasFailed(try2_2));

const try2_3 = try2(digit, cCharacter).consume("");
// console.log(try2_3);
assert("try2:5", ParserValue.hasFailed(try2_3));

// === tryAll ===
const tryall0 = tryAll([digit, cCharacter]).consume("xxxx");
// console.log(tryall0);
assert("tryAll:0", ParserValue.hasFailed(tryall0));

const tryall1 = tryAll([digit, cCharacter]).consume("cxxx");
assert("tryAll:1", tryall1.rest == "xxx");
assert("tryAll:2", tryall1.val === "c");

const tryall2 = tryAll([]).consume("foo");
// console.log(tryall2);
assert("tryAll:3", ParserValue.hasFailed(tryall2));

