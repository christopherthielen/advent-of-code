import { range, readLines, toInt } from "../util";

const lines = readLines("input.txt")
  .map((line) => /(toggle|turn on|turn off) (\d+),(\d+) through (\d+),(\d+)/.exec(line))
  .map((match) => {
    const [x1, y1, x2, y2] = match.slice(2).map(toInt);
    const val = match[1] === "toggle" ? 2 : match[1] === "turn on" ? 1 : -1;
    return { val, x1, y1, x2, y2 };
  });

const grid = new Array(1000).fill(0).map(() => new Array(1000).fill(0));
lines.forEach((line) =>
  range(line.x1, line.x2).forEach((x) =>
    range(line.y1, line.y2).forEach((y) => {
      grid[y][x] = Math.max(0, grid[y][x] + line.val);
    })
  )
);
console.log(grid.flat().reduce((acc, x) => acc + x, 0));
