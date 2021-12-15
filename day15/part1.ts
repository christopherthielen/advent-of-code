import * as fs from "fs";
import { countBy, range } from "lodash";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");

const grid = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .map((line) => line.split("").map((num) => parseInt(num, 10)));
