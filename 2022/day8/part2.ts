import { Grid, Item } from "../grid";
import { readLines, toInt } from "../util";

const lines = readLines("input.txt");
const values = lines.map((line) => line.split("").map(toInt));
const grid = new Grid(values);
type Spot = Item<number>;

const scoreForDirection = (grid: Grid<number>, base: Spot, current: Spot, getNext: (x: Spot) => Spot) => {
  const next = getNext(current);
  if (!next) {
    return 0;
  } else if (next.val >= base.val) {
    return 1;
  }
  return 1 + scoreForDirection(grid, base, next, getNext);
};

const score = (grid: Grid<number>, item: Spot) => {
  const n = scoreForDirection(grid, item, item, (item) => item.n);
  const w = scoreForDirection(grid, item, item, (item) => item.w);
  const s = scoreForDirection(grid, item, item, (item) => item.s);
  const e = scoreForDirection(grid, item, item, (item) => item.e);
  return n * w * s * e;
};

const all = grid.items.flat();
const best = all.reduce((acc, item) => {
  return score(grid, acc) < score(grid, item) ? item : acc;
}, grid.items[0][0]);

console.log(score(grid, best), best.toString());
