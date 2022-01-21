import { countBy } from "lodash";
import { readLines } from "../util";

const input = readLines("input.txt").map((line) => line.split(""));
const result = new Array(input[0].length).fill(null).map((c, idx) => {
  const chars = input.map((line) => line[idx]);
  return Object.entries(countBy(chars)).sort((a, b) => b[1] - a[1])[0][0];
});

console.log(result.join(""));
