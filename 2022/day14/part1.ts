import { array2d, Grid } from "../grid";
import { product, range, readLines, toInt } from "../util";

const lines = readLines("input.txt");
const parseCoords = (line: string) => {
  return line.split(" -> ").map((string) => string.split(",").map(toInt));
};

const grid = new Grid(array2d(1000, 1000, () => "."));
grid.items[0][500].val = "+";
const rocks = lines.map((line) => parseCoords(line));
rocks.forEach((coordList) => {
  coordList.reduce((prev, next) => {
    const xrange = range(prev[0], next[0]);
    const yrange = range(prev[1], next[1]);
    product(xrange, yrange).forEach(([x, y]) => (grid.items[y][x].val = "#"));
    return next;
  });
});

type Coord = { x: number; y: number };
const getSandPos = (grid: Grid<string>) => {
  const startCoord: Coord = { x: 500, y: 0 };
  let pos: Coord = startCoord;
  let next: Coord = pos;
  do {
    pos = next;
    next = tick(grid, pos);
    if (next.y >= grid.height - 1) {
      return null;
    }
  } while (next.x !== pos.x || next.y !== pos.y);
  return pos;
};

const tick = (grid: Grid<string>, { x, y }: Coord): Coord => {
  if (grid.items[y + 1][x].val === ".") {
    return { x, y: y + 1 };
  } else if (grid.items[y + 1][x - 1].val === ".") {
    return { x: x - 1, y: y + 1 };
  } else if (grid.items[y + 1][x + 1].val === ".") {
    return { x: x + 1, y: y + 1 };
  }
  return { x, y };
};

function dropSand(grid: Grid<string>) {
  const sandpos = getSandPos(grid);
  if (sandpos) {
    grid.items[sandpos.y][sandpos.x].val = "o";
  }
  return sandpos;
}

function printSmallGrid() {
  const smallGrid = new Grid(grid.rect(490, 0, 510, 20).map((lines) => lines.map((item) => item.val)));
  console.log();
  console.log(smallGrid.toString((item) => item.val));
}

let count = 0;
while (dropSand(grid) !== null) {
  count++;
}
console.log(count);
printSmallGrid();
