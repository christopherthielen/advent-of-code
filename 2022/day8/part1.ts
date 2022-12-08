import { readLines, splitArray, toInt } from "../util";
import { Grid, Item } from "../grid";

const lines = readLines("input.txt");
const values = lines.map((line) => line.split("").map(toInt));
const grid = new Grid(values);

const isVisible = (grid: Grid<number>, item: Item<number>) => {
  // edge
  if (item.x === 0 || item.x === grid.width - 1 || item.y === 0 || item.y === grid.height - 1) {
    return true;
  }

  const row = grid.row(item.y);
  const col = grid.col(item.x);
  const [left, right] = splitArray(row, (x) => x === item);
  const [above, below] = splitArray(col, (x) => x === item);

  const isShorter = (x) => x.val < item.val;
  return left.every(isShorter) || right.every(isShorter) || above.every(isShorter) || below.every(isShorter);
};

const visible = grid.items.flat().filter((item) => isVisible(grid, item));
console.log(visible.length);
