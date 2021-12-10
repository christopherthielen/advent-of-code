import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/).filter((line) => !!line);

const OPEN = "([{<".split("");
const CLOSE = ")]}>".split("");
const POINTS = { ")": 3, "]": 57, "}": 1197, ">": 25137 };

const closeFor = (opener: string) => {
  const idx = OPEN.indexOf(opener);
  return CLOSE[idx];
};

const openFor = (closer: string) => {
  const idx = CLOSE.indexOf(closer);
  return OPEN[idx];
};

function syntaxErrorScore(line: string): number {
  const stack = [] as string[];
  const chars = line.split("");
  for (let char of chars) {
    if (OPEN.includes(char)) {
      stack.push(char);
    } else if (CLOSE.includes(char)) {
      const tail = stack[stack.length - 1];
      const expectedCloser = closeFor(tail);
      if (char === expectedCloser) {
        stack.pop();
      } else {
        // console.log(`${line} - Expected ${expectedCloser}, but found ${char} instead.`);
        return POINTS[char];
      }
    } else {
      throw new Error("unexpected char in input: " + char);
    }
  }

  if (stack.length === 0) {
    // console.log("Good input      : " + line);
  } else {
    // console.log("Incomplete input: " + line);
  }

  return 0;
}

console.log(lines.reduce((acc, line) => acc + syntaxErrorScore(line), 0));
