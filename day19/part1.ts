import * as fs from "fs";
import * as path from "path";
import assert = require("node:assert");

const DEBUG = 0;
const debug1 = (...args: string[]) => DEBUG >= 1 && console.log(...args);
const debug2 = (...args: string[]) => DEBUG >= 2 && console.log(...args);

const inputPath = path.resolve(__dirname, "example1.txt");
const lines = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x);
