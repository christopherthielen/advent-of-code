import { Grid, Item } from "../grid";
import { readLines } from "../util";

type Data = {
  height: number;
  distance: number;
  char: string;
};

type Node = Item<Data>;
const grid = new Grid<Data>(
  readLines("input.txt").map((line) => {
    return line.split("").map((char) => {
      const letter = char === "S" ? "a" : char === "E" ? "z" : char;
      const height = letter.charCodeAt(0) - "a".charCodeAt(0);
      return { distance: Number.MAX_SAFE_INTEGER, char, height };
    });
  })
);

const start = grid.items.flat().find((item) => item.val.char === "S");
const dest = grid.items.flat().find((item) => item.val.char === "E");
dest.val.distance = 0;

const visit = (node: Node) => {
  node.neighbors(Item.DIRECTIONS.STRAIGHT).forEach((neighbor) => {
    const canTraverse = node.val.height - neighbor.val.height <= 1;
    if (canTraverse && neighbor.val.distance > node.val.distance + 1) {
      neighbor.val.distance = node.val.distance + 1;
    }
  });
};

const unvisited = grid.items.flat();
unvisited.push(null);
let lastCount = unvisited.length;
while (unvisited.length) {
  const node = unvisited.shift();
  if (node === null) {
    const newCount = unvisited.length;
    if (lastCount === newCount) {
      console.log("no updates, exiting");
      break;
    } else {
      lastCount = newCount;
      unvisited.push(null);
    }
  } else {
    visit(node);
    const isTraversable = node.neighbors(Item.DIRECTIONS.STRAIGHT).some((n) => node.val.height + 1 >= n.val.height);
    if (isTraversable && node.val.distance === Number.MAX_SAFE_INTEGER) {
      unvisited.push(node);
    }
  }
}
// console.log(grid.toString((item) => `[${pad(`${item.val.height}:${item.val.distance > 10000 ? "X" : item.val.distance}`, 7)}]`));
// console.log(grid.toString((item) => `[${pad(`${item.val.distance > 10000 ? "X" : item.val.distance}`, 3)}]`));
const best = grid.items.flat().reduce((acc, item) => (item.val.height === 0 && item.val.distance < acc.val.distance ? item : acc), start);
const { x, y, val } = best;
console.log({ x, y, val });
