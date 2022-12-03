import { readLines } from "../util";

let lines = readLines("input.txt");
const groups = [];
while (lines.length) {
  const group = lines.slice(0, 3);
  lines = lines.slice(3);
  groups.push(group);
}

function priority(char: string) {
  const offset = char.toLowerCase() === char ? "a".charCodeAt(0) - 1 : "A".charCodeAt(0) - 27;
  return char.charCodeAt(0) - offset;
}

const sum = groups.reduce((acc, [one, two, three]) => {
  const inall = one.split("").find((char) => two.includes(char) && three.includes(char));
  return acc + priority(inall);
}, 0);

console.log(sum);
