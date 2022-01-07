import { isEqual } from "lodash";
import { combine, range, readLines, toInt, uniqR, uniqUsingIsEqualR } from "../util";

// const lines = readLines("example1.txt");
const lines = readLines("input.txt"); // every value is a prime number
const sum = (numbers: number[]) => numbers.reduce((a, x) => a + x);
const weights = lines.map(toInt).sort((a, b) => b - a);
const totalWeight = weights.reduce((a, x) => a + x);
const targetWeight = totalWeight / 3;

const fewestPackages = range(1, weights.length).find((qty) => {
  return combine(weights, qty).filter((c) => sum(c) === targetWeight).length;
});

const group1Combos = combine(weights, fewestPackages)
  .filter((c) => sum(c) === targetWeight)
  .map((arr) => arr.sort((a, b) => a - b));

group1Combos
  .sort((a, b) => a.reduce((acc, x) => acc * x) - b.reduce((acc, x) => acc * x))
  .forEach((combo) => {
    console.log(
      combo,
      combo.reduce((a, x) => a * x)
    );
  });

// const without = <T>(items: T[], idx: number) => [...items.slice(0, idx), ...items.slice(idx + 1)];
// const findSums = (items: number[], targetSum: number): number[][] => {
//   return items.flatMap((item, idx) => {
//     const remainingSum = targetSum - item;
//     if (remainingSum === 0) {
//       return [[item]];
//     }
//     const rest = without(items, idx).filter((x) => x <= remainingSum);
//     return findSums(rest, remainingSum).map((array) => [item, ...array]);
//   });
// };

// const best = { combo: null, qe: Number.MAX_SAFE_INTEGER };
// group1Combos.forEach((combo) => {
//   const remainingWeights = combo.reduce((a, x) => without(a, a.indexOf(x)), weights);
//   const otherSums = findSums(remainingWeights, targetWeight)
//     .map((x) => x.sort((a, b) => b - a))
//     .reduce(uniqUsingIsEqualR, [] as number[][])
//     .sort((a, b) => a.reduce((acc, x) => acc * x) - b.reduce((acc, x) => acc * x));
// });
