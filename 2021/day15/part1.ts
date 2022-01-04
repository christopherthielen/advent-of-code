import * as fs from "fs";
import * as path from "path";
import * as chalk from "chalk";

const inputPath = path.resolve(__dirname, "input.txt");

const grid = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x)
  .map((line) => line.split("").map((num) => parseInt(num, 10)));
const GRID_SIZE = grid.length;

type Coord = [number, number];
type Path = Coord[];

const idToCoord = (id: number): Coord => [Math.floor(id / GRID_SIZE), id % GRID_SIZE];
const coordToId = ([y, x]: Coord) => y * GRID_SIZE + x;

const naivePath: Path = [[0, 0]];
for (let i = 1; i < GRID_SIZE; i++) {
  naivePath.push([i - 1, i]);
  naivePath.push([i, i]);
}

const risk = ([y, x]: Coord) => grid[y][x];

function neighbors([y, x]: Coord) {
  const coords = [];
  if (x > 0) coords.push([y, x - 1]);
  if (y > 0) coords.push([y - 1, x]);
  if (x < GRID_SIZE - 1) coords.push([y, x + 1]);
  if (y < GRID_SIZE - 1) coords.push([y + 1, x]);
  return coords;
}

interface Node {
  coord: Coord;
  id: number;
  neighbors: number[];
  risk: number;
  processing: boolean;
  activelyChecking: boolean;
  checking: boolean;
  cost?: number;
  previousStep?: number;
}

function node(coord: Coord): Node {
  return {
    coord: coord,
    id: coordToId(coord),
    neighbors: neighbors(coord).map(coordToId),
    risk: risk(coord),
    processing: false,
    activelyChecking: false,
    checking: false,
    cost: null,
    previousStep: null,
  };
}

const nodes: Node[] = [];
for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
  nodes.push(node(idToCoord(i)));
}
nodes[0].cost = 0;
nodes[0].previousStep = -1;

const nodeGrid: Node[][] = [];
for (let y = 0; y < GRID_SIZE; y++) {
  const line = (nodeGrid[y] = []);
  for (let x = 0; x < GRID_SIZE; x++) {
    line[x] = nodes[y * GRID_SIZE + x];
  }
}

const end = nodes[nodes.length - 1];

let bestPathsFound = 0;
let nodesTested = 0;
let start = Date.now();
let lastLog = Date.now();
let lastPathsFoundTimes = [];

function checkComplete() {
  nodesTested++;
  const now = Date.now();
  if (now - lastLog > 500) {
    lastLog = now;
    const elapsed = Date.now() - start;
    const cumulativePathFindTime = lastPathsFoundTimes.reduce((acc, x) => acc + x, 0);
    console.log(
      `Elapsed: ${elapsed}ms. Found ${bestPathsFound} paths. Tested ${nodesTested} nodes. ` +
        `Time per path (last ${lastPathsFoundTimes.length}): ${cumulativePathFindTime / lastPathsFoundTimes.length / 1000}sec ` +
        `Tests per sec: ${(nodesTested / elapsed) * 1000}`
    );
    dump();
  }
}

const pickBest = (node1: Node, node2?: Node): Node => {
  return !node1 ? node2 : !node2 ? node1 : node1.cost < node2.cost ? node1 : node2;
};

function updateNode(node: Node): number {
  const best = node.neighbors.map((nid) => nodes[nid]).reduce(pickBest);
  const newCost = best.cost + node.risk;
  if (best.id === node.previousStep && newCost === node.cost) {
    return 0;
  }
  node.previousStep = best.id;
  node.cost = newCost;
  checkComplete();
  return 1;
}

function processGrid(): number {
  // const costs = nodes.map((n) => n.cost);
  let updates = 0;
  for (let i = 1; i < GRID_SIZE * 2; i++) {
    for (let x = 0; x <= i; x++) {
      const y = i - x;
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        updates += updateNode(nodes[y * GRID_SIZE + x]);
      }
    }
  }
  checkComplete();
  return updates;
}

while (processGrid() > 0) {}
dump();

console.log(`Computed cost of ${bestPathsFound} nodes`);

function walkPathBackwards(node: Node, acc: Node[]): Node[] {
  if (node.id === 0) {
    return acc;
  }

  const prev = nodes[node.previousStep];

  if (!prev || acc.includes(prev)) {
    console.log("loop detected");
    return acc;
  }

  acc.push(prev);
  return walkPathBackwards(prev, acc);
}

function dump() {
  const pathBack = end ? walkPathBackwards(end, []).map((node) => node.id) : [];
  const gridString = nodeGrid
    .map((line) => {
      return line
        .map((node) => {
          return node.cost
            ? pathBack.includes(node.id)
              ? chalk.yellowBright("" + node.risk)
              : node.risk
            : node.processing
            ? chalk.greenBright("X")
            : node.activelyChecking
            ? chalk.bgGray("?")
            : node.checking
            ? chalk.bgGray(" ")
            : " ";
        })
        .join("");
    })
    .join("\n");

  console.log(gridString);
  console.log("Total Cost " + end.cost);
}
