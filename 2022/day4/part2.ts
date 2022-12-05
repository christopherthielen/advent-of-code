import { intersection } from "lodash";
import { range, readLines, toInt } from "../util";

const parseRange = (str: string) => {
  const [begin, end] = str.split("-").map(toInt);
  return range(begin, end);
};
const overlaps = (a: number[], b: number[]) => intersection(a, b).length > 0;
const lines = readLines("input.txt").map((line) => line.split(",").map(parseRange));

console.log(lines.filter(([a, b]) => overlaps(a, b)).length);
