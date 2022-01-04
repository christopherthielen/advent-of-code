import { readLines } from "../util";

const lines = readLines("input.txt");
const baddies = ["ab", "cd", "pq", "xy"];
const nice = lines
  .filter((line) => !baddies.some((bad) => line.includes(bad)))
  .filter((line) => line.replace(/[^aeiou]/g, "").length >= 3)
  .filter((line) => line.split("").some((c, i) => line[i + 1] === c));

console.log(nice.length);
