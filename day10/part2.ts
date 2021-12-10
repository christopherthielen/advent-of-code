import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/).filter((line) => !!line);

const OPEN = "([{<".split("");
const CLOSE = ")]}>".split("");
const POINTS = { ")": 1, "]": 2, "}": 3, ">": 4 };

const closeFor = (opener: string) => {
  const idx = OPEN.indexOf(opener);
  return CLOSE[idx];
};

const openFor = (closer: string) => {
  const idx = CLOSE.indexOf(closer);
  return OPEN[idx];
};

function getIncompleteChunks(line: string): string[] {
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
        return null;
      }
    } else {
      throw new Error("unexpected char in input: " + char);
    }
  }

  if (stack.length === 0) {
    // console.log("Good input      : " + line);
    return null;
  } else {
    return stack;
  }
}

const chunks = lines.map((line) => getIncompleteChunks(line)).filter((x) => !!x);

const scores = chunks
  .map((chunk) => {
    return chunk.reverse().reduce((score, char) => {
      return score * 5 + POINTS[closeFor(char)];
    }, 0);
  })
  .sort((a, b) => a - b);

console.log({ middleScore: scores[Math.floor(scores.length / 2)] });
