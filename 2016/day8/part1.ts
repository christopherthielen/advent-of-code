import { array2d, Grid, Item } from "../grid";
import { readLines, toInt } from "../util";

type Rect = { type: "rect"; x: number; y: number };
type RotateRow = { type: "rotate row"; axis: number; distance: number };
type RotateColumn = { type: "rotate column"; axis: number; distance: number };
type Cmd = Rect | RotateColumn | RotateRow;

const file = "input.txt";
const grid = new Grid(array2d(6, 50, "."));
// const file = 'example.txt'
// const grid = new Grid(array2d(3, 7, "."));

const commands: Cmd[] = readLines(file).map((line) => {
  const regExp = /(rect|rotate row|rotate column) (?:(\d+)x(\d+)|[yx]=(\d+) by (\d+))/;
  const [_match, type, x, y, axis, distance] = regExp.exec(line);
  return { type, x: toInt(x), y: toInt(y), axis, distance: toInt(distance) } as any as Cmd;
});

commands.forEach((cmd) => {
  function rotate<T>(items: Item<T>[], d: number) {
    const values = items.map((item, idx) => item.val);
    for (let i = 0; i < items.length; i++) {
      items[i].val = values[(i - d + items.length) % items.length];
    }
  }

  if (cmd.type === "rect") {
    grid.rect(0, 0, cmd.x, cmd.y).forEach((i) => (i.val = "#"));
  } else if (cmd.type === "rotate column") {
    rotate(grid.col(cmd.axis), cmd.distance);
  } else if (cmd.type === "rotate row") {
    rotate(grid.row(cmd.axis), cmd.distance);
  }
});
console.log(grid.toString());

const length = grid.items.flat().filter((i) => i.val === "#").length;
console.log(length + " lit");
