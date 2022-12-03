import { readLines } from "../util";

const lines = readLines("input.txt").map((line) => {
  const midpoint = line.length / 2;
  const left = line.substring(0, midpoint);
  const right = line.substring(midpoint);
  return [left, right];
});

function priority(char: string) {
  const offset = char.toLowerCase() === char ? "a".charCodeAt(0) - 1 : "A".charCodeAt(0) - 27;
  return char.charCodeAt(0) - offset;
}

const sum = lines.reduce((acc, [left, right]) => {
  const inBoth = left.split("").find((char) => right.includes(char));
  return acc + priority(inBoth);
}, 0);

console.log(sum);
