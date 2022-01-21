import { readLines, toInt } from "../util";

const input = readLines("input.txt").map((line) =>
  line
    .split(/[ ]+/)
    .filter((x) => x)
    .map(toInt)
);

const possible = input.filter(([a, b, c]) => a < b + c && b < a + c && c < a + b);
console.log(possible.length);
