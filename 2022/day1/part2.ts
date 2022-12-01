import { readFile, toInt } from "../util";

const elves = readFile("input.txt").split(/\n\n/).filter(x => x);
const calories = elves.map((elfInput) => {
  return elfInput.split(/\n/)
    .filter(str => !!str)
    .map(toInt)
    .reduce((acc, x) => (acc + x), 0);
});

const sorted = calories.sort((a, b) => b - a);
console.log(sorted[0] + sorted[1] + sorted[2]);
