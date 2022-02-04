import assert from "node:assert";
import { array2d, Grid, Item } from "../grid";

declare module "../grid" {
  interface Item<T> {
    cost: number;
  }
}

const favnum = 1358;
const dest = { x: 31, y: 39 };

// const favnum = 10;
// const dest = { x: 7, y: 4 };

const grid = new Grid(array2d(52, 52, "."));
grid.items.flat().forEach((item) => {
  const { x, y } = item;
  const val = x * x + 3 * x + 2 * x * y + y + y * y + favnum;
  const binary = val.toString(2);
  const ones = binary.split("").filter((x) => x === "1");
  const even = ones.length % 2 === 0;
  item.val = even ? "." : "#";
});
const neighbors = ({ n, e, w, s }: Item<string>) => [n, e, w, s].filter((x) => x);

const start = grid.items[1][1];
start.cost = 0;
const queue = [start];

// part 1
while (queue.length) {
  const item = queue.shift();
  if (item.x === dest.x && item.y === dest.y) {
    console.log(`Found ${item.toString()} with a cost of ${item.cost}`);
    break;
  }

  neighbors(item)
    .filter((n) => n.val !== "#")
    .filter((n) => n.cost === undefined || n.cost > item.cost + 1)
    .forEach((n) => {
      n.cost = item.cost + 1;
      queue.push(n);
    });
}

// part 2
while (queue.length) {
  const item = queue.shift();
  neighbors(item)
    .filter((n) => n.val !== "#")
    .filter((n) => n.cost === undefined || n.cost > item.cost + 1)
    .forEach((n) => {
      n.cost = item.cost + 1;
      queue.push(n);
    });
}
console.log(grid.items.flat().filter((item) => item.cost !== undefined && item.cost <= 50).length);
