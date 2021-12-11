import * as fs from "fs";
import { range } from "lodash";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const grid = input
  .split(/[\r\n]/)
  .filter((line) => !!line)
  .map((line) => line.split("").map((char) => parseInt(char, 10)));

interface Coord {
  x: number;
  y: number;
}

function neighbors({ x, y }: Coord): Coord[] {
  return [
    { x: x - 1, y: y - 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y: y },
    { x: x + 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ].filter((coord) => coord.y >= 0 && coord.y < grid.length && coord.x >= 0 && coord.x < grid[0].length);
}

const allCoordinates = [];
for (let y = 0; y < grid.length; y++) {
  for (let x = 0; x < grid[0].length; x++) {
    allCoordinates.push({ y, x });
  }
}

function flash({ y, x }: Coord): number {
  grid[y][x]++;
  return neighbors({ y, x })
    .filter((n) => ++grid[n.y][n.x] === 10)
    .reduce((acc, coord) => acc + flash(coord), 1);
}

function step(grid: number[][]) {
  allCoordinates.forEach(({ y, x }) => grid[y][x]++);
  const stepFlashes = allCoordinates.filter(({ y, x }) => grid[y][x] === 10).reduce((acc, c) => acc + flash(c), 0);
  allCoordinates.forEach(({ y, x }) => (grid[y][x] = grid[y][x] > 9 ? 0 : grid[y][x]));
  return stepFlashes;
}

function printGrid() {
  console.log(grid.map((line) => line.join("")).join("\n") + "\n");
}

const totalFlashes = range(0, 100).reduce((acc, _i) => acc + step(grid), 0);
console.log({ totalFlashes });

printGrid();
