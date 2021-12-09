import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/).filter((line) => !!line);
const lineLen = lines[0].length;

const lineAsNumberArray = (line: string) => line.split("").map((x) => parseInt(x, 10));
const grid = lines.map((line) => lineAsNumberArray(line));
const neighborsx = (y: number, x: number) => {
  if (x === 0) {
    return [grid[y][x + 1]];
  } else if (x === lineLen - 1) {
    return [grid[y][x - 1]];
  } else {
    return [grid[y][x - 1], grid[y][x + 1]];
  }
};

const neighborsy = (y: number, x: number) => {
  if (y === 0) {
    return [grid[y + 1][x]];
  } else if (y === lines.length - 1) {
    return [grid[y - 1][x]];
  } else {
    return [grid[y - 1][x], grid[y + 1][x]];
  }
};

let totalRisk = 0;
for (let x = 0; x < lineLen; x++) {
  for (let y = 0; y < lines.length; y++) {
    const val = grid[y][x];
    const neighbors = [...neighborsx(y, x), ...neighborsy(y, x)];
    if (neighbors.every((n) => val < n)) {
      // console.log({ x, y, val, neighbors });
      totalRisk += 1 + val;
    }
  }
}

console.log(totalRisk);
