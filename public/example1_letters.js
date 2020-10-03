
import { Parser, ParserValue } from "../src/index";

// ===== HELPERS =====
// String -> Bool
function isEmptyString(s) {
  return s.length == 0;
}

// === LETTER ===
// Character -> Boolean
function isChar(d) {
  // TODO

}
// TODO: lowercase, uppercase, case-insensitive

// Parser(Char)
export const cCharacter = Parser(s => {
  if (isEmptyString(s)) {
    return ParserValue.failure("Expected a 'c' character instead of empty string");
  } else if (s[0] == "c") {
    return ParserValue.success({val: "c", rest: s.slice(1)});
  } else {
    return ParserValue.failure(`Expected a 'c' character instead of '${s[0]}'`);
  }
});

// Char -> Parser(Char)
export function character(c) {
  return Parser(s => {
    if (isEmptyString(s)) {
      // TODO a/an? nah...
      return ParserValue.failure(`Expected a '${c}' character instead of empty string`);
    } else if (s[0] === c) {
      return ParserValue.success({val: c, rest: s.slice(1)});
    } else {
      // TODO a/an? nah...
      return ParserValue.failure(`Expected a '${c}' character instead of '${s[0]}'`);
    }
  });
}
// note that cCharacter is just character('c')

