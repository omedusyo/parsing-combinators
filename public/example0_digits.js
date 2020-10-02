
import { Parser, ParserValue } from "../src/index";

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
    return ParserValue.failure("Expected a digit instead of empty string");
  } else if (isDigit(s[0])) {
    return ParserValue.success({val: digits2values[s[0]], rest: s.slice(1)});
  } else {
    return ParserValue.failure(`Expected a digit instead of '${s[0]}'`);
  }
});


