import * as fs from "fs";
import { countBy, range } from "lodash";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/);
const crabs = lines
  .map((line) => line.split(","))
  .flat()
  .filter((x) => !!x)
  .map((num) => parseInt(num, 10))
  .sort((a, b) => a - b);

const min = Math.min(...crabs);
const max = Math.max(...crabs);
const crabLocations = Object.entries(countBy(crabs)).map(([key, value]) => {
  return { pos: parseInt(key, 10), count: value as number };
});

// store the cost to move 'n' spaces
const costTable = [0];
for (let i = 1; i < max; i++) {
  costTable[i] = costTable[i - 1] + i;
}

const positions = range(min, max + 1).map((pos) => {
  const cost = crabLocations.reduce((acc, loc) => {
    const movesPerCrab = Math.abs(pos - loc.pos);
    const costPerCrab = costTable[movesPerCrab];
    // if (isNaN(acc)) {
    //   console.log({ pos, loc, movesPerCrab, costPerCrab });
    // }
    return acc + costPerCrab * loc.count;
  }, 0);

  return { pos, cost };
});

const sorted = positions.sort((a, b) => a.cost - b.cost);
console.log({ min, max, sorted });
