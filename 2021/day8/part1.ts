import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const lines = input.split(/[\r\n]/).filter((line) => !!line);
const outputStrs = lines
  .map((line) => line.split(" | ")[1].split(/ +/))
  .flat()
  .filter((signal) => [2, 3, 4, 7].includes(signal.length));

console.log(outputStrs.length);
