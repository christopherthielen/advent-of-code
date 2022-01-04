import { readLines } from "../util";

const input: any[] = readLines("input.txt")[0].split("").map(c => c === "(" ? 1 : c === ")" ? -1 : c);
console.log(input.reduce((acc, x) => acc + x, 0));
