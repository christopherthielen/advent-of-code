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

function walk(from: string, revistSmallCave: string, path: string[], visited: string[]) {
  path.push(from);
  visited.push(from);
  if (from !== "end") {
    const moves = steps[from].filter((cave) => {
      return cave !== "start" && (cave === revistSmallCave || !isSmall(cave) || !visited.includes(cave));
    });

    for (const move of moves) {
      // console.log({ from, move, revistSmallCave, path: path.join() });
      const nextRevisit = move === revistSmallCave && visited.includes(move) ? "" : revistSmallCave;
      walk(move, nextRevisit, path.slice(), visited.slice());
    }
  } else {
    const pathString = path.join();
    if (!paths.includes(pathString)) {
      paths.push(path.join());
    }
  }
}

const smallCaves = Object.keys(steps)
  .filter(isSmall)
  .filter((cave) => cave !== "start" && cave !== "end");

for (const smallCave of smallCaves) {
  walk("start", smallCave, [], []);
}

console.log(paths.length);
paths.sort().forEach((p) => console.log(p));
console.log(paths.length);
