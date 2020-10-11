
import { maximalReduce, succeed, fail, char } from "../src/index";

//
// consider the language consisting of
//     epsilon
//       ()
//      (())
//     ((()))
//    (((())))
//      ...
// or similarly
//     epsilon
//       ab
//      aabb
//     aaabbb
//    aaaabbbb

const a = char('a');
const b = char('b');

const as = maximalReduce(a, 0, (state, _) => state + 1);
const bs = maximalReduce(b, 0, (state, _) => state + 1);
// console.log(as.consume("aaax")); // should produce 3

// console.log(as.then(n => bs.map(m => [n, m])).consume("aaaabbbbbbx").val);

const balance = as.then(n => bs.map(m => [n, m])).then(([n, m]) => {
  if (n === m) {
    return succeed("they are the same")
  } else {
    return fail("they ain't the same")
  }
});

// console.log(balance.consume("aaabbb"))
// console.log(balance.consume("aaabbb"))

