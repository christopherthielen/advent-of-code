import { readLines } from "../util";

const line = readLines("input.txt")[0];
const matches = [...line.matchAll(/-?\d+/g)];
const digits = matches.map((m) => parseInt(m[0], 10));
console.log(digits.reduce((acc, x) => acc + x));
