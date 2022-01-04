import * as fs from "fs";
import { memoize, range } from "lodash";
import * as path from "path";

// const inputPath = path.resolve(__dirname, "example1.txt");
const inputPath = path.resolve(__dirname, "input.txt");

type Spot = { v: ">" | "v" | "."; d: Spot; r: Spot };
const grid: Spot[][] = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x)
  .map((line) => line.split("").map((v) => ({ v } as Spot)));

const H = grid.length;
const W = grid[0].length;

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const spot = grid[y][x];
    const r = grid[y][(x + 1) % W];
    const d = grid[(y + 1) % H][x];
    spot.r = r;
    spot.d = d;
  }
}

const spots = grid.flat();

const dump = () => console.log(grid.map((line) => line.map((s) => s.v).join("")).join("\n") + "\n");
const moveRight = (s: Spot) => ((s.r.v = s.v), (s.v = "."));
const moveDown = (s: Spot) => ((s.d.v = s.v), (s.v = "."));

const step = () => {
  const rights = spots.filter((s) => s.v === ">" && s.r.v === ".");
  rights.forEach(moveRight);
  const downs = spots.filter((s) => s.v === "v" && s.d.v === ".");
  downs.forEach(moveDown);
  return rights.length + downs.length;
};

dump();
let count = 0;
while (++count) {
  if (step() === 0) {
    break;
  }
}
dump();
console.log({ count });
