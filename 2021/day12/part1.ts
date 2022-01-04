import * as fs from "fs";
import { range } from "lodash";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");

const steps: { [node: string]: string[] } = {};
const recordEdge = (from: string, to: string) => {
  steps[from] = steps[from] ?? [];
  steps[from] = steps[from].includes(to) ? steps[from] : steps[from].concat(to);
};

input
  .split(/[\r\n]/)
  .filter((line) => !!line)
  .map((line) => line.split("-"))
  .forEach(([from, to]) => {
    recordEdge(from, to);
    recordEdge(to, from);
  });

const paths = [];

const isSmall = (cave: string) => cave.toLocaleLowerCase() === cave;

function walk(from: string, path: string[], visited: string[]) {
  path.push(from);
  visited.push(from);
  if (from !== "end") {
    const moves = steps[from].filter((cave) => {
      return (isSmall(cave) && !visited.includes(cave)) || !isSmall(cave);
    });
    for (const move of moves) {
      walk(move, path.slice(), visited.slice());
    }
  } else {
    paths.push(path);
  }
}

walk("start", [], []);
console.log(paths.length);
paths.sort().forEach((p) => console.log(p.join()));
