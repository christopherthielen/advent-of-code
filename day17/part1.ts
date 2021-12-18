import * as fs from "fs";
import * as path from "path";
import * as chalk from "chalk";
import assert = require("node:assert");

const inputPath = path.resolve(__dirname, "example1.txt");

const lines = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x);

const [_match, ...groups] = /target area: x=([-\d]+)\.\.([-\d]+), y=([-\d]+)\.\.([-\d]+)/.exec(lines[0]);
const [x1, x2, y1, y2] = groups.map((x) => parseInt(x, 10));

console.log({ x1, x2, y1, y2 });
