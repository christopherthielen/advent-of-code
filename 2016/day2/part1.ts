import { readLines } from "../util";

const instructions = readLines("input.txt").map((line) =>
  line.split("").map((c) => (c === "U" ? 0 : c === "D" ? 1 : c === "L" ? 2 : c === "R" ? 3 : c))
);

const digits = {
  // [u,d,l,r]
  1: [1, 4, 1, 2],
  2: [2, 5, 1, 3],
  3: [3, 6, 2, 3],
  4: [1, 7, 4, 5],
  5: [2, 8, 4, 6],
  6: [3, 9, 5, 6],
  7: [4, 7, 7, 8],
  8: [5, 8, 7, 9],
  9: [6, 9, 8, 9],
};

const result = instructions.map((list) => {
  return list.reduce((a, x) => {
    return digits[a][x];
  }, 5);
});

console.log(result);
