import { readLines, toInt } from "../util";

const lines = readLines("input.txt").map((line) =>
  line
    .split(/[ ]+/)
    .filter((x) => x)
    .map(toInt)
);
const numbers = []
  .concat(lines.map((l) => l[0]))
  .concat(lines.map((l) => l[1]))
  .concat(lines.map((l) => l[2]));
const triangles = numbers.reduce(
  (acc, n) => {
    if (acc[acc.length - 1].length === 3) acc.push([]);
    const triangle = acc[acc.length - 1];
    triangle.push(n);
    return acc;
  },
  [[]]
);
console.log(triangles);

const possible = triangles.filter(([a, b, c]) => a < b + c && b < a + c && c < a + b);
console.log(possible.length);
