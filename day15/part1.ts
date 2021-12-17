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

function cost(path: Path): number {
  return path.reduce((acc, [y, x]) => acc + grid[y][x], 0);
}

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

const hasCost = (node) => node.cost !== null;
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

let currentBest: Node = null;
let bestPathsFound = 0;
let nodesTested = 0;
let start = Date.now();
let lastLog = Date.now();
let lastPathFound = Date.now();
let lastPathsFoundTimes = [];

function nodeComplete(node: Node) {
  const timeToFindLastPath = Date.now() - lastPathFound;
  lastPathFound = Date.now();
  lastPathsFoundTimes.push(timeToFindLastPath);
  if (lastPathsFoundTimes.length > 25) {
    lastPathsFoundTimes.shift();
  }
  bestPathsFound++;
}

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

function naivePathCost(startNode: Node): number {
  // console.log(`computing naive path from node ${startNode.coord} id ${startNode.id}`);
  let node = startNode;
  let cost = 0;
  while (node.coord[0] > 0) {
    cost += node.risk;
    node = nodes[(node.coord[0] - 1) * GRID_SIZE];
    // console.log(node.coord, node.id);
  }
  while (node.coord[1] > 0) {
    cost += node.risk;
    node = nodes[node.id - 1];
    // console.log(node.coord, node.id);
  }
  // console.log(`naive path from node ${startNode.id} cost: ${cost}`);
  return cost;
}

function sortUpAndToLeft(node1: Node, node2: Node) {
  const dy = node1.coord[0] - node2.coord[0];
  return dy === 0 ? node1.coord[1] - node2.coord[1] : dy;
}

function processNode(y: number, x: number): number {
  const node = nodes[coordToId([y, x])];
  if (node.cost) {
    return;
  }

  node.processing = true;

  const neighbors = node.neighbors.map((nid) => nodes[nid]);
  const knownCost = neighbors.filter((x) => hasCost(x));
  const unknownCost = neighbors.filter((x) => !hasCost(x));

  let best: Node = knownCost.length ? knownCost.reduce(pickBest) : undefined;
  currentBest = best;
  // const minKnownCost = Math.min(...nodes.map((n) => n.cost).filter((x) => x));
  let bestCost: number = best?.cost ?? naivePathCost(node);

  unknownCost.forEach((neighbor) => {
    const neighborCost = cheapestCostHome(neighbor, [node.id], 0, bestCost, []);
    if (neighborCost < bestCost) {
      best = neighbor;
      bestCost = neighborCost;
      currentBest = best;
    }
  });

  if (best) {
    node.previousStep = best.id;
    node.cost = bestCost + node.risk;
  }
  node.processing = false;

  nodeComplete(node);
  clearChecking();

  return node.cost;
}

// Walks paths until it finds a path home
// Returns the total cost of the path, including the current node.
// Avoids re-entering a node already in the path
function cheapestCostHome(
  node: Node,
  avoidNodes: number[],
  previousCost: number,
  maxCost: number,
  // minKnownCost: number,
  lowestPriceCache: number[]
): number {
  const currentCost = previousCost + node.risk;
  if (currentCost >= maxCost) {
    return Number.MAX_SAFE_INTEGER;
  }
  const previousVisitLowPrice = lowestPriceCache[node.id];
  if (previousVisitLowPrice !== undefined && currentCost > previousVisitLowPrice) {
    return Number.MAX_SAFE_INTEGER;
  }
  lowestPriceCache[node.id] = currentCost;

  node.activelyChecking = true;
  node.checking = true;

  const neighbors = node.neighbors.filter((nid) => !avoidNodes.includes(nid)).map((nid) => nodes[nid]);
  const knownCost = neighbors.filter((x) => hasCost(x));
  const unknownCost = neighbors.filter((x) => !hasCost(x)).sort(sortUpAndToLeft);

  let best: Node = knownCost.length ? knownCost.reduce(pickBest) : undefined;
  let bestCost = best?.cost ?? Number.MAX_SAFE_INTEGER - node.risk;

  unknownCost.forEach((neighbor) => {
    const neighborCost = cheapestCostHome(neighbor, avoidNodes.concat(node.id), currentCost, maxCost, lowestPriceCache);
    if (neighborCost < bestCost) {
      best = neighbor;
      bestCost = neighborCost;
    }
  });

  checkComplete();
  node.activelyChecking = false;
  return bestCost + node.risk;
}

function clearChecking() {
  nodes.forEach((n) => {
    n.checking = false;
    n.activelyChecking = false;
  });
}

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
debugger;
dump();

// function processGrid(x1: number, x2: number, y1: number, y2: number) {
//   if (x1 === x2 && y1 === y2) {
//     processNode(y1, x1);
//   } else {
//     const xmid = Math.floor(x1 + (x2 - x1) / 2);
//     const ymid = Math.floor(y1 + (y2 - y1) / 2);
//     if (x1 === x2) {
//       processGrid(x1, x2, y1, ymid);
//       processGrid(x1, x2, ymid + 1, y2);
//     } else if (y1 === y2) {
//       processGrid(x1, xmid, y1, y2);
//       processGrid(xmid + 1, x2, y1, y2);
//     } else {
//       processGrid(x1, xmid, y1, ymid);
//       processGrid(x1, xmid, ymid + 1, y2);
//       processGrid(xmid + 1, x2, y1, ymid);
//       processGrid(xmid + 1, x2, ymid + 1, y2);
//     }
//   }
// }
// processGrid(0, GRID_SIZE, 0, GRID_SIZE);

// range(1, GRID_SIZE).forEach((i) => {
//   range(0, i).forEach((y) => processNode(y, i));
//   range(0, i + 1).forEach((x) => processNode(i, x));
// });

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
