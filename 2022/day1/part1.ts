import { readFile, readLines, toInt } from "../util";

const elves = readFile("input.txt").split(/\n\n/).filter(x => x);
const calories = elves.map((elfInput, i) => {
  return elfInput.split(/\n/)
    .filter(str => !!str)
    .map(toInt)
    .reduce((acc, x) => (acc + x), 0);
});

const max = calories.reduce((acc, x) => Math.max(acc, x), 0);
console.log(max);
