
import { char, succeed, digit, any, or, Rec, maximalMunch1 } from "../src/index";

//  ()
//  {}
//  []
//  {[(())]}
//  {({()})}

// Paren := {
//   ['{', '}'],
//   ['(', ')'],
//   ['[', ']']
// }
// Paren, Parser(A) -> Parser(A)
function insideParen(paren, p) {
  return char(paren[0])._then(p).then_(char(paren[1]));
}
// console.log(insideParen(['[', ']'], digit).consume('[1]'));

// Parser(A) -> Parser(A)
function paren(p) {
  return any([
    insideParen(['(', ')'], p),
    insideParen(['[', ']'], p),
    insideParen(['{', '}'], p),
  ]);
}
// console.log(paren(digit).consume('(1)')); // succeeds with 1
// console.log(paren(digit).consume('[1]')); // succeeds with 1
// console.log(paren(digit).consume('{1}')); // succeeds with 1

const openParen = any([char("("), char("["), char("{")]);

// I need lookahead
const exp = Rec(() =>
  openParen.cond(_ =>
    paren(exp)
  , _ =>
    succeed(true)
  )
);
// console.log(exp.consume('{([{}])}'));


