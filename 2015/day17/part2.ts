import { combine, range, readLines, toInt } from "../util";

const containers: number[] = readLines("input.txt").map(toInt);
const wins = range(0, containers.length).flatMap((count) => {
  return combine(containers, count).filter((list) => list.reduce((acc, x) => acc + x) === 150);
});
const minimumCount = Math.min(...wins.map((w) => w.length));
console.log(wins.filter((w) => w.length === minimumCount).length);
