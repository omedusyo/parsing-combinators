
import {
  ParserValue,
  succeed, then,
  map,
  pair, first, second, sequence, map2, maps,
  maximalMunch, maximalReduce, maximalMunchDiscard,
  or, any, ifFails, setError, mapError,
  satisfies, string, end
} from "../src/index";

import { digit } from "./example0_digits";
import { cCharacter, character } from "./example1_letters";
import { nat } from "./example2_numbers";
import {  } from "./example3_arith_expressions";

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

// === MAP2 ===
const map2_0 = map2(digit, digit, (x, y) => x + y).consume("45foo");
assert("map2:0", map2_0.rest == "foo");
assert("map2:1", map2_0.val === 4 + 5);

// === MAPS ===
const sum = xs => xs.reduce((x, y) => x + y, 0);
const maps0 = maps([digit,digit,digit,digit,digit], sum).consume("12345foo");
// console.log(maps0);
assert("maps:0", maps0.rest == "foo");
assert("maps:1", maps0.val === 1 + 2 + 3 + 4 + 5);

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

// === or ===
const or_0 = or(digit, digit).consume("29foo");
assert("or:0", or_0.rest == "9foo");
assert("or:1", or_0.val === 2);

const or_1 = or(digit, cCharacter).consume("cxxx");
assert("or:2", or_1.rest == "xxx");
assert("or:3", or_1.val === "c");

const or_2 = or(digit, cCharacter).consume("xxxx");
// console.log(or_2);
assert("or:4", ParserValue.hasFailed(or_2));

const or_3 = or(digit, cCharacter).consume("");
// console.log(or_3);
assert("or:5", ParserValue.hasFailed(or_3));

// === ifFails/catch ===
const iffails0 = digit.catch(msg => cCharacter).consume("cxxx");
assert("ifFails:0", iffails0.rest == "xxx");
assert("ifFails:1", iffails0.val === "c");

const iffails1 = digit.catch(msg => cCharacter).consume("1xxx");
assert("ifFails:2", iffails1.rest == "xxx");
assert("ifFails:3", iffails1.val === 1);

const iffails2 = digit.catch(msg => cCharacter).consume("xxx");
assert("ifFails:3", ParserValue.hasFailed(iffails2));

// === setError ===
const seterror0 = digit.setError("meaningful error!").consume("1xxx");
assert("setError:0", seterror0.rest == "xxx");
assert("setError:1", seterror0.val === 1);

const seterror1 = digit.setError("meaningful error!").consume("xxx");
assert("setError:2", seterror1.message == "meaningful error!");

// === mapError ===
const maperror0 = digit.mapError(msg => msg + " & my meaningful error!").consume("1xxx");
assert("maperror:0", maperror0.rest == "xxx");
assert("maperror:1", maperror0.val === 1);

const maperror1 = digit.mapError(msg => msg + " & my meaningful error!").consume("xxx");
// console.log(maperror1);
assert("maperror:2", ParserValue.hasFailed(maperror1));

// === any ===
const tryall0 = any([digit, cCharacter]).consume("xxxx");
// console.log(tryall0);
assert("any:0", ParserValue.hasFailed(tryall0));

const tryall1 = any([digit, cCharacter]).consume("cxxx");
assert("any:1", tryall1.rest == "xxx");
assert("any:2", tryall1.val === "c");

const tryall2 = any([]).consume("foo");
// console.log(tryall2);
assert("any:3", ParserValue.hasFailed(tryall2));

// === character ===
const char0 = character("a").consume("abc");
assert("character:0", char0.rest == "bc");
assert("character:1", char0.val == "a");

const char1 = character("a").consume("bc");
// console.log(char1);
assert("character:2", ParserValue.hasFailed(char1));

// === satisfies ===
const satisfies0 = satisfies(c => c == 'a').consume("axxx");
assert("satisfies:0", satisfies0.rest == "xxx");
assert("satisfies:1", satisfies0.val === "a");

const satisfies1 = satisfies(c => c == 'a').consume("xxxx");
// console.log(satisfies1);
assert("satisfies:2", ParserValue.hasFailed(satisfies1));

// === string ===
const string0 = string("foo").consume("fooxbar");
assert("string:0", string0.rest == "xbar");
assert("string:1", string0.val === "foo");

const string1 = string("").consume("xxx");
assert("string:2", string1.rest == "xxx");
assert("string:3", string1.val === "");

// === end ===
const end0 = end.consume("");
assert("end:0", end0.rest == "");
assert("end:1", end0.val === "");

// === nat ===
const nat0 = nat.consume("123xxx");
assert("nat:0", nat0.rest == "xxx");
assert("nat:1", nat0.val == 123);

const nat1 = nat.consume("00123xxx");
assert("nat:2", nat1.rest == "xxx");
assert("nat:3", nat1.val == 123);

const nat2 = nat.consume("00xxx");
assert("nat:3", nat2.rest == "xxx");
assert("nat:4", nat2.val == 0);

const nat3 = nat.consume("0xxx");
assert("nat:5", nat3.rest == "xxx");
assert("nat:6", nat3.val == 0);

const nat4 = nat.consume("xxx");
// console.log(nat4);
assert("nat:7", ParserValue.hasFailed(nat4));

const nat5 = nat.consume("");
// console.log(nat5);
assert("nat:8", ParserValue.hasFailed(nat5));

const nat6 = nat.consume("-5");
// console.log(nat6);
assert("nat:9", ParserValue.hasFailed(nat6));

