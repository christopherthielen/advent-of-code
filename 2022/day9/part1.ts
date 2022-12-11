import { array2d, Grid } from "../grid";
import { readLines, toInt } from "../util";

const DIRECTION_TO_NEWS = { U: "n", D: "s", R: "e", L: "w" };
const moves = readLines("input.txt")
  .map((line) => line.split(" "))
  .map(([direction, count]) => [DIRECTION_TO_NEWS[direction], toInt(count)] as [Direction, number]);

console.log(moves.length + " moves");
const grid = new Grid(array2d(1000, 1000, () => ({ head: 0, tail: 0 })));
const start = grid.items[500][500];

let head = start;
let tail = start;

type Direction = "n" | "e" | "w" | "s";
const move = (direction: Direction) => {
  const prev = head;
  const next = head[direction];
  const dx = Math.abs(next.x - tail.x);
  const dy = Math.abs(next.y - tail.y);
  if (dx > 1 || dy > 1) {
    tail = prev;
  }
  head = next;
  head.val.head++;
  tail.val.tail++;
};

moves.forEach(([direction, count]) => {
  for (let i = 0; i < count; i++) {
    move(direction);
  }
});

const total = grid.items.flat().reduce((acc, x) => acc + (x.val.tail >= 1 ? 1 : 0), 0);
console.log(total);
