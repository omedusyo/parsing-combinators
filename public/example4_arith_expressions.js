
import { Rec, maximalMunch, maximalMunchDiscard, or, char, end, ParserValue } from "../src/index";
import { nat } from "./example2_numbers";

function Add(xs) {
  return { type: "Add", xs };
}

function Mul(xs) {
  return { type: "Mul", xs };
}

function Nat(n) {
  return { type: "Nat", n };
}

function showSeq(xs) {
  return xs.map(show).join(" ");
}

function show(exp) {
  switch (exp.type) {
    case "Nat":
      return String(exp.n);
    case "Add":
      return `(+ ${showSeq(exp.xs)})`;
    case "Mul":
      return `(* ${showSeq(exp.xs)})`;
  }
}

const n0 = Nat(0);
const n1 = Nat(1);
const n2 = Nat(2);
const n3 = Nat(3);
const n4 = Nat(4);
const exp1 = Add([n2, n3]);
const exp2 = Mul([n2, n3]);
const exp3 = Mul([Add([n1, n2]), n3, n4]);
// console.log(show(exp3));

function sum(xs) {
  return xs.reduce((x, y) => x + y, 0);
}

function prod(xs) {
  return xs.reduce((x, y) => x * y, 1);
}

function Eval(exp) {
  switch (exp.type) {
    case "Nat":
      return exp.n;
    case "Add":
      return sum(exp.xs.map(Eval));
    case "Mul":
      return prod(exp.xs.map(Eval));
  }
}

// console.log(Eval(exp3));


// ===== PARSING =====
const opTable = {
  ["+"]: Add,
  ["*"]: Mul,
};

// === whitespace ===
const _ = maximalMunchDiscard(char(" "));
// non-trivial whitespace
const $_ = char(" ")._then(_);

// === operator symbol ===
const operator = or(char("+"), char("*"));
// console.log(operator.consume("*xxx"))

// === seqences/lists ===
//    epsilon
// or $_ p
// or $_ p $_ p
// or $_ p $_ p $_ p
// or ...
//
// Parser(A) -> Parser(Array(A))
const preDelimitedSeq = p =>
  maximalMunch($_._then(p));
// console.log(preDelimitedSeq(nat).consume(" 123  43  56"));
// console.log(preDelimitedSeq(nat).consume(""));
// console.log(preDelimitedSeq(nat).consume("  "));
// console.log(preDelimitedSeq(nat).consume("  123"));

// leftParen _ operator preDelimitedSeq(p) _ rightParen
const leftParen = char('(');
const rightParen = char(')');
const list = p =>
  leftParen._then(_)._then(operator).then(opSymbol => {
    const op = opTable[opSymbol];
    return preDelimitedSeq(p).map(xs => op(xs));
  }).then_(_).then_(rightParen);

// console.log(list(nat).consume("(+ 1 2)xx")); // should succeed with Add([1,2])
// console.log(list(nat).consume("(* 1 2)xx")); // should succeed with Mul([1, 2])
// console.log(list(nat).consume("(  + 1 2  34  )xx")); // should succeed with Add([1, 2, 34])
// console.log(list(nat).consume("xx")); // should fail
// console.log(list(nat).consume("()xx")); // should fail
// console.log(list(nat).consume("(+)xx")); //  should succeed with Add([])
// console.log(list(nat).consume("(  + )xx")); //  should succeed with Add([])

// === expression ===
// nat | list(expr)
const natExpr = nat.map(n => Nat(n));
const expr = Rec(() =>
  or(natExpr, list(expr))
);
// console.log(expr.consume("123 ")); // succeds with 123
// console.log(expr.consume("0 ")); // succeds with 0
// console.log(expr.consume("(+ 1 2) ")); // succeds with Add([1,2])
// console.log(expr.consume("(* 1 2 5) ")); // succeds with Add([1,2,5])
// console.log(expr.consume("(+ (* 3 4) 2) ")); // succeds with Add([Mul([3, 4]), 2])
// console.log(expr.consume("(+ (+ (+ (+) 1) 2) 3) ")); // succeds with Add([Add([Add([Add([]), 1]), 2]), 3])

// ws expr ws end
const program = _._then(expr).then_(_).then_(end);
// console.log(program.consume("  123 ")); // succeds with 123
// console.log(program.consume("  0 ")); // succeds with 0
// console.log(program.consume("  (+ 1 2) ")); // succeds with Add([1,2])
// console.log(program.consume("  (* 1 2 5) ")); // succeds with Add([1,2,5])
// console.log(program.consume("  (+ (* 3 4) 2) ")); // succeds with Add([Mul([3, 4]), 2])
// console.log(program.consume("  (+ (+ (+ (+) 1) 2) 3) ")); // succeds with Add([Add([Add([Add([]), 1]), 2]), 3])



// === Summary of definitions ===
// const opTable = {
//   ["+"]: Add,
//   ["*"]: Mul,
// };
// const _ = maximalMunchDiscard(char(" "));
// const $_ = char(" ")._then(_);
// const preDelimitedSeq = p =>
//   maximalMunch($_._then(p));
// const leftParen = char('(');
// const rightParen = char(')');
// const list = p =>
//   leftParen._then(_)._then(operator).then(opSymbol => {
//     const op = opTable[opSymbol];
//     return preDelimitedSeq(p).map(xs => op(xs));
//   }).then_(_).then_(rightParen);
// const natExpr = nat.map(n => Nat(n));
// const expr = Rec(() =>
//   or(natExpr, list(expr))
// );
// const program = _._then(expr).then_(_).then_(end);

const inputs = [
  "  123  ",
  " (+ 1 2 3) ",
  " (+ (* 3 4) (* 5 6  ) 3) ",
];

const output = [];
inputs.forEach(s => {
  const v = program.consume(s);
  if (ParserValue.hasSucceeded(v)) {
    // v.value
    output.push({
      succeeded: true,
      input: s,
      interpretation: show(v.val),
      result: Eval(v.val),
    });
  } else {
    output.push({
      succeeded: false,
      input: s,
      message: v.message,
    });
  }
});

output.forEach(({succeeded, input, interpretation, result}) => {
  if (succeeded) {
    console.log("_______________");
    console.log(`input : "${input}"`);
    console.log(`interp: ${interpretation}`);
    console.log(`result: ${result}`);
    console.log("_______________");
  } else {
    console.log("______FAIL_____");
    console.log("______FAIL_____");
  }
});
console.log(output);

