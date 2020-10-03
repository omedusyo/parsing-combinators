
import { Parser, maximalMunchDiscard, or, char, maps } from "../src/index";
import { nat } from "./example2_numbers";

// Nat(1)
//
// Add(e1, e2)
//
// Mul(e1, e2)
//
// so for example (2 + 3)*5 corresponds to
//   Mul(Add(Nat(2), Nat(3)), Nat(5))
// and in our concrete syntax
//   (* (+ 2 3) 5)

// TODO: start of with binary...

function Add(left, right) {
  return { type: "Add", left, right };
}

function Mul(left, right) {
  return { type: "Mul", left, right };
}

function Nat(n) { 
  return { type: "Nat", n };
}

function show(e) {
  switch (e.type) {
    case "Nat":
      return String(e.n);
    case "Add":
      return `(+ ${show(e.left)} ${show(e.right)})`;
    case "Mul":
      return `(* ${show(e.left)} ${show(e.right)})`;
  }
}

function Eval(e) {
  switch (e.type) {
    case "Nat":
      return e.n
    case "Add":
      return Eval(e.left) + Eval(e.right);
    case "Mul":
      return Eval(e.left) * Eval(e.right);
  }
}

const example0 = Mul(Add(Nat(1), Nat(2)), Nat(3)); // (1 + 2)*3
// console.log(Eval(example0));

const opTable = {
  ["+"]: Add,
  ["*"]: Mul,
};

// whitespace
const _ = maximalMunchDiscard(char(" "));
// non-trivial whitespace
const $_ = char(" ")._then(_);

// 0 | 1 | 2 | ...
const natExp = nat.map(n => Nat(n)); // nat.map(Nat)

// natExp | opExp
//
// this is like or(natExp, opExp) and the indirection is here because
// opExp depends on exp and exp depends on opExp
const exp = Parser(s =>
  or(natExp, opExp).consume(s)
);

// (_+__exp__exp_)
// (_*__exp__exp_)
// operator expression
const opExp = maps([
  char("("), _, or(char("+"), char("*")), $_, exp, $_, exp, _, char(")")
], ([_lparen, _ws0, opSymbol, _ws1, e1, _ws2, e2]) => opTable[opSymbol](e1, e2));


export const binexp = exp;
export const showbinexp = show;

