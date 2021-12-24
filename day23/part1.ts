import * as fs from "fs";
import * as path from "path";

const inputPath = path.resolve(__dirname, "example1.txt");
// const inputPath = path.resolve(__dirname, "input.txt");

const lines = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x);
