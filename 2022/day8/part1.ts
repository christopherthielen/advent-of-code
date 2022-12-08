import { readLines, splitArray, toInt } from "../util";
import { array2d, Grid, Item } from "../grid";

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

  return (
    left.every((x) => x.val < item.val) ||
    right.every((x) => x.val < item.val) ||
    above.every((x) => x.val < item.val) ||
    below.every((x) => x.val < item.val)
  );
};

const visible = grid.items.flat().filter((item) => isVisible(grid, item));
console.log(visible.length);
