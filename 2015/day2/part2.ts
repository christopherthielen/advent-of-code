import { readLines } from "../util";

const input: any[] = readLines("input.txt")[0]
  .split("")
  .map((c) => (c === "(" ? 1 : c === ")" ? -1 : c));

function basement() {
  let acc = 0;
  for (let i = 0; i < input.length; i++) {
    acc += input[i];
    if (acc < 0) {
      return i + 1;
    }
  }
}

console.log(basement());
