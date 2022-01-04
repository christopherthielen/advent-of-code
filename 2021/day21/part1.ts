import * as fs from "fs";
import * as path from "path";

// const inputPath = path.resolve(__dirname, "example1.txt");
const inputPath = path.resolve(__dirname, "input.txt");
const positions = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x)
  .map((line) => /Player . starting position: (\d+)/.exec(line)[1])
  .map((pos) => parseInt(pos, 10));

let d100 = 0;
const roll3 = () => [d100++, d100++, d100++].map((x) => (x % 100) + 1) as [number, number, number];
// 0 based positions
let p1pos = positions[0] - 1;
let p1score = 0;
let p2pos = positions[1] - 1;
let p2score = 0;

console.log({ d100, p1pos, p1score, p2pos, p2score });

while (p1score < 1000 && p2score < 1000) {
  const p1roll = roll3();
  const p1moves = p1roll.reduce((acc, x) => acc + x);
  p1pos = (p1pos + p1moves) % 10;
  p1score += p1pos + 1;
  // console.log({ d100, p1roll: p1roll.join("+"), p1pos, p1score });
  if (p1score < 1000) {
    const p2roll = roll3();
    const p2moves = p2roll.reduce((acc, x) => acc + x);
    p2pos = (p2pos + p2moves) % 10;
    p2score += p2pos + 1;
    // console.log({ d100, p2roll: p2roll.join("+"), p2pos, p2score });
  }
}

console.log({ d100, p1pos, p1score, p2pos, p2score });

console.log(d100 * Math.min(p1score, p2score));
