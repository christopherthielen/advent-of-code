import { readLines, toInt, combine } from "../util";

const input = readLines("input.txt").map((line) => line.split("x").map(toInt)) as Array<[number, number, number]>;

const total = input.reduce((acc, [l, h, w]) => {
  const perimiters = combine([l, h, w], 2).map(([x, y]) => x + x + y + y);
  return acc + l * h * w + Math.min(...perimiters);
}, 0);

console.log({ total });
