
import { Parser, ParserValue, char, maximalReduce, maximalMunch, digit } from "../src/index";

// consumes all consecutive zeroes at te beginning, and counts them up
//
// zeroes.consume("0000xxx") ~> 4
// zeroes.consume("0xxx") ~> 1
// zeroes.consume("xxx") ~> 0

// note that this will always succeed with a natural number
const zeroes = maximalReduce(char("0"), 0, (numOfZeroes, _) => numOfZeroes + 1);


// very inefficient
// natOfDigits([1,2,3]) ~> 123
function natOfDigits(digits) {
  let n = 0;
  digits.reverse().forEach((d, i) => {
    n += d * 10**i;
  });
  return n;
}

// very inefficient
export const nat = Parser(s0 => {
  const { val: numofzeroes, rest: s1 } = zeroes.consume(s0);
  const v = digit.consume(s1);
  if (ParserValue.hasSucceeded(v)) {
    const s2 = v.rest;
    const { val: digits, rest: s3 } = maximalMunch(digit).consume(s2);
    const n = natOfDigits([v.val, ...digits]);
    return ParserValue.success({val: n, rest: s3});
  } else {
    if (numofzeroes === 0) {
      return ParserValue.failure("PARSING ERROR: Expected a natural number");
    } else {
      return ParserValue.success({val: 0, rest: s1});
    }
  }
});

