import * as fs from "fs";

export function readLines(filename: string): string[] {
  return readFile(filename).split(/[\r\n]/).filter(x => !!x);
}

export function readFile(filename: string) {
  return fs.readFileSync(filename, "utf-8");
}
