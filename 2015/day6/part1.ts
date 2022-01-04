import { range, readLines, toInt } from "../util";

const lines = readLines("input.txt")
  .map((line) => /(toggle|turn on|turn off) (\d+),(\d+) through (\d+),(\d+)/.exec(line))
  .map((match) => {
    const [x1, y1, x2, y2] = match.slice(2).map(toInt);
    return { val: match[1], x1, y1, x2, y2 };
  });

const grid = new Array(1000).fill(0).map(() => new Array(1000).fill(false));
console.log(grid[1]);
lines.forEach((line) =>
  range(line.x1, line.x2).forEach((x) =>
    range(line.y1, line.y2).forEach((y) => {
      grid[y][x] = line.val === "toggle" ? !grid[y][x] : line.val === "turn on";
    })
  )
);
console.log(grid.flat().filter((x) => x).length);
