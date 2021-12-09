import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/).filter((line) => !!line);
const lineLen = lines[0].length;

const lineAsNumberArray = (line: string) => line.split("").map((x) => parseInt(x, 10));
const grid = lines.map((line) => lineAsNumberArray(line));

const neighbors = (y: number, x: number) => {
  const values = [grid[y][x - 1], grid[y][x + 1], grid[y - 1]?.[x], grid[y + 1]?.[x]];
  return values.filter((x) => x !== undefined);
};

let totalRisk = 0;
for (let x = 0; x < lineLen; x++) {
  for (let y = 0; y < lines.length; y++) {
    const val = grid[y][x];
    if (neighbors(y, x).every((n) => val < n)) {
      totalRisk += 1 + val;
    }
  }
}

console.log(totalRisk);
