import { range, readLines, toInt } from "../util";

const parseRange = (str: string) => {
  const [begin, end] = str.split("-").map(toInt);
  return range(begin, end);
};
const fullyIncludes = (a: number[], b: number[]) => a[0] >= b[0] && a[a.length - 1] <= b[b.length - 1];
const lines = readLines("input.txt").map((line) => line.split(",").map(parseRange));

console.log(lines.filter(([a, b]) => fullyIncludes(a, b) || fullyIncludes(b, a)).length);
