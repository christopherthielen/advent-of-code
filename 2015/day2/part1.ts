import { readLines, toInt, combine } from "../util";

const input = readLines("input.txt").map((line) => line.split("x").map(toInt)) as Array<[number, number, number]>;

const total = input.reduce((acc, [l, h, w]) => {
  const areas = combine([l, h, w], 2).map(([x, y]) => x * y);
  const extra = Math.min(...areas);
  const paperForPresent = [extra, ...areas, ...areas].reduce((acc, x) => acc + x);
  return acc + paperForPresent;
}, 0);

console.log({ total });
