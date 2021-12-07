import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/);
const fish = lines
  .map((line) => line.split(","))
  .flat()
  .filter((x) => !!x)
  .map((num) => parseInt(num, 10));

console.log(fish.length);

for (let i = 0; i < 80; i++) {
  fish.slice().forEach((oneFish, idx) => {
    if (oneFish === 0) {
      fish[idx] = 6;
      fish.push(8);
    } else {
      fish[idx] = oneFish - 1;
    }
  });
}

console.log(fish.length);
