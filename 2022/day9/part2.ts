import { array2d, Direction, Grid, Item } from "../grid";
import { readLines, toInt } from "../util";

const DIRECTION_TO_NEWS = { U: "n", D: "s", R: "e", L: "w" };
const moves = readLines("input.txt")
  .map((line) => line.split(" "))
  .map(([direction, count]) => [DIRECTION_TO_NEWS[direction], toInt(count)] as [Direction, number]);
type Spot = { head: number; tail: number };

const GRID_SIZE = 1000;
const START = Math.floor(GRID_SIZE / 2);
const grid = new Grid<Spot>(array2d(GRID_SIZE, GRID_SIZE, () => ({ head: 0, tail: 0 } as Spot)));
const start = grid.items[START][START];
const segments: Item<Spot>[] = new Array(10).fill(start);

const toofar = (i1: Item<Spot>, i2: Item<Spot>) => Math.abs(i1.x - i2.x) > 1 || Math.abs(i1.y - i2.y) > 1;

const move = (direction: Direction) => {
  // Move the head
  segments[0] = segments[0][direction];

  // Check each subsequent pairs of segments
  for (let i = 0; i < segments.length - 1; i++) {
    const leader = segments[i];
    const follower = segments[i + 1];

    if (toofar(leader, follower)) {
      // move follower according to (?the rules?)
      const dx = Math.sign(leader.x - follower.x);
      const dy = Math.sign(leader.y - follower.y);
      const xprime = follower.x + dx;
      const yprime = follower.y + dy;
      const next = grid.items[yprime][xprime];
      segments[i + 1] = next;
    }
  }

  const newHead = segments[0];
  const newTail = segments[segments.length - 1];
  newHead.val.head++;
  newTail.val.tail++;
};

console.log(moves.length + " moves");
// const renderItem = (item: Item<Spot>) => {
//   const idx = segments.indexOf(item);
//   switch (idx) {
//     case -1:
//       return ".";
//     case 0:
//       return "H";
//     case 9:
//       return "T";
//     default:
//       return "" + idx;
//   }
// };

moves.forEach(([direction, count]) => {
  console.log(`== ${direction} ${count} ==`);
  for (let i = 0; i < count; i++) {
    move(direction);
    // console.log(grid.toString((item) => renderItem(item)));
    // console.log();
  }
});

const total = grid.items.flat().reduce((acc, x) => acc + (x.val.tail >= 1 ? 1 : 0), 0);
console.log(total);
// console.log(grid.toString((item) => (item.val.tail >= 1 ? "#" : ".")));
