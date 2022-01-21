import { readLines } from "../util";

const instructions = readLines("input.txt").map((line) =>
  line.split("").map((c) => (c === "U" ? 0 : c === "D" ? 1 : c === "L" ? 2 : c === "R" ? 3 : c))
);

const digits = {
  // [u,d,l,r]
  1: "1311".split(""),
  2: "2623".split(""),
  3: "1724".split(""),
  4: "4834".split(""),
  5: "5556".split(""),
  6: "2A57".split(""),
  7: "3B68".split(""),
  8: "4C79".split(""),
  9: "9989".split(""),
  A: "6AAB".split(""),
  B: "7DAC".split(""),
  C: "8CBC".split(""),
  D: "BDDD".split(""),
};

const result = instructions.reduce(
  (prev, list) => {
    const next = list.reduce((a, x) => {
      return digits[a][x];
    }, prev[prev.length - 1]);
    return [...prev, next];
  },
  [5]
);

console.log(result);
