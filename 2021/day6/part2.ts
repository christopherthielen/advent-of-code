import * as fs from "fs";
import { countBy } from "lodash";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/);
const fish = lines
  .map((line) => line.split(","))
  .flat()
  .filter((x) => !!x)
  .map((num) => parseInt(num, 10));

let fishCounts = Object.fromEntries(Object.entries(countBy(fish)).map(([key, value]) => [key, BigInt(value)]));

for (let i = 0; i < 256; i++) {
  const entries = Object.entries(fishCounts);
  fishCounts = {};
  entries.forEach(([key, value]) => {
    const days = parseInt(key, 10);
    if (days <= 0) {
      fishCounts[8] = (fishCounts[8] || BigInt(0)) + value;
      fishCounts[6] = (fishCounts[6] || BigInt(0)) + value;
    } else {
      fishCounts[days - 1] = (fishCounts[days - 1] || BigInt(0)) + value;
    }
  });
}

console.log(Object.values(fishCounts).reduce((acc, val) => acc + val));
