import * as yargs from "yargs";
import { array2d } from "../grid";
import { perf, showPerf } from "../perf";
import { progress } from "../progress";
import { range, readLines } from "../util";
import { Shape, shapes } from "./shapes";

["perf", "example"].forEach((opt) => yargs.option(opt, { boolean: true }));

const HEIGHT = 128;
const WIDTH = 7;
const INPUT = yargs.argv["example"] ? "example.txt" : "input.txt";
const isExample = yargs.argv["example"];
const jets = readLines(INPUT)[0]
  .split("")
  .map((char) => (char === "<" ? -1 : 1)) as (-1 | 1)[];
const grid = array2d(HEIGHT, WIDTH, () => ".");

let jetidx = 0;
let shapeidx = 0;
const itemLoop = <T>(items: T[]): Function & { atStart: () => boolean } => {
  let i = -1;
  const nextItem = () => {
    const idx = ++i % items.length;
    if (items[0] === -1 || items[0] === 1) {
      jetidx = idx;
    } else {
      shapeidx = idx;
    }
    return items[idx];
  };
  nextItem.atStart = () => {
    return i % items.length === 0;
  };
  return nextItem;
};

const nextJet = itemLoop(jets);
const nextShape = itemLoop(shapes);

const printGrid = (state: State) => {
  const copy = state.grid.slice(0, 10).map((line) => line.slice());
  if (state.shape)
    rawCoords(state)
      .filter(({ y }) => y >= 0 && y < copy.length)
      .forEach(({ x, y }) => (copy[y][x] = "@"));
  copy.reverse().forEach((line) => console.log(line.join("")));
};

const rawCoords = (state: State, dx: number = 0, dy: number = 0) =>
  state.shape.coords.map((coord) => {
    const x = coord.x + state.shapex + dx;
    const y = coord.y + state.shapey + dy + state.offsety;
    return { x, y };
  });

// spawns shape and pre-applies the first three moves
const spawnShape = perf(function spawnShape(state: State) {
  state.shape = nextShape();
  state.shapex =
    firstThreeTicksCache[state.shape.name][nextJet() === -1 ? "<" : ">"][nextJet() === -1 ? "<" : ">"][nextJet() === -1 ? "<" : ">"];
  state.shapey = state.highest + 1;
  if (state.shapey + state.offsety + 5 >= grid.length) {
    adjustWindow(state);
  }
  // printGrid(state);
});

const moveShape = (state: State, dx: number, dy: number): boolean => {
  const { grid } = state;
  const blocked = rawCoords(state, dx, dy).some(({ x, y }) => x < 0 || x >= WIDTH || grid[y][x] !== ".");
  if (blocked) return false;
  state.shapex += dx;
  state.shapey += dy;
  return true;
};

const placeShape = (state: State) => {
  const { grid } = state;
  const coords = rawCoords(state);
  coords.forEach(({ x, y }) => {
    if (y >= grid.length) {
      throw new Error(`ArrayIndexOutOfBounds ${y} >= ${grid.length}`);
    }
    if (x < 0 || x >= WIDTH) {
      throw new Error(`ArrayIndexOutOfBounds ${x} < 0 || ${x} >= ${WIDTH}`);
    }
    grid[y][x] = "#";
  });
  const maxy = coords.map((c) => c.y).reduce((acc, x) => Math.max(acc, x), 0);
  state.highest = Math.max(state.highest, maxy - state.offsety);
  state.shape = state.shapex = state.shapey = null;
};

const firstThreeTicksCache = {};
shapes.forEach((shape) => {
  const DIRS = ["<", ">"];
  const jetvalues = DIRS.map((d1) => DIRS.map((d2) => DIRS.map((d3) => [d1, d2, d3]))).flat(2);
  jetvalues.forEach((moves) => {
    const state: State = { offsety: 0, highest: 0, shape: shape, grid: array2d(10, 7, () => "."), shapex: 2, shapey: 4 };
    moves.forEach((move) => {
      moveShape(state, move === "<" ? -1 : 1, 0);
      moveShape(state, 0, -1);
    });
    const cache = (firstThreeTicksCache[shape.name] = firstThreeTicksCache[shape.name] ?? {});
    cache[moves[0]] = cache[moves[0]] ?? {};
    cache[moves[0]][moves[1]] = cache[moves[0]][moves[1]] ?? {};
    cache[moves[0]][moves[1]][moves[2]] = state.shapex;
  });
});
type State = { shape: Shape; highest: number; offsety: number; shapey: number; shapex: number; grid: string[][] };
const state: State = {
  shape: null,
  highest: 0,
  offsety: 0,
  shapey: 0,
  shapex: 0,
  grid: grid,
};

const dropShape = perf(function dropShape(state: State) {
  while (state.shape !== null) {
    const jet = nextJet();
    moveShape(state, jet, 0);
    if (!moveShape(state, 0, -1)) {
      placeShape(state);
    }
  }
});

// lowest reachable empty space
const newFloor = perf(function newFloor(state: State): number {
  const { grid } = state;
  const last = grid.length - 1;
  const mask = new Array(7).fill(true);

  for (let y = last - 1; y > 0; y--) {
    const line = grid[y];
    // First, unmask positions where the current mask doesn't have a rock but the next line does
    for (let x = 0; x < mask.length; x++) {
      if (mask[x] && line[x] !== ".") {
        mask[x] = false; // unmask any positions where the next line has a rock
      }
    }

    for (let x = 0; x < mask.length; x++) {
      if (mask[x] && line[x - 1] === ".") {
        for (let x2 = x; x2 > 0 && mask[x2] === false && line[x2] === "."; x--) mask[x2] = true;
        for (let x2 = x; x2 <= WIDTH && mask[x2] === false && line[x2] === "."; x--) mask[x2] = true;
      }
    }

    if (!mask.some((x) => x === true)) {
      return y;
    }
  }

  return 0;
});

const updateArray = perf(function updateArray(state: State, floor: number) {
  for (let y = 0; y < state.grid.length - floor; y++) {
    state.grid[y] = state.grid[y + floor];
  }
  for (let y = state.grid.length - floor; y < state.grid.length; y++) {
    state.grid[y] = new Array(WIDTH).fill(".");
  }
  state.offsety -= floor;
});

const adjustWindow = perf((state: State) => {
  const floor = newFloor(state);
  if (floor < state.grid.length / 4) {
    throw new Error(`${floor} < ${state.grid.length / 4}`);
  }
  updateArray(state, floor);

  // console.log({ highest: state.highest, minY, newFloor, offsety: state.offsety });
}, "adjustWindow");

range(0, 6).forEach((x) => (grid[0][x] = "-"));
// const ITERATIONS = 10;
// const ITERATIONS = 2022;
// const ITERATIONS = 4000;
const ITERATIONS = 1000000000000;
let prevHighest = 0;
let prevIter = 0;
let cycles = 0;
const heightDeltaPerCycle = isExample ? 53 : 2659;
const iterationsPerCycle = isExample ? 35 : 1725;
const cycleJetIdx = isExample ? 2 : 1;
const cycleShapeIdx = isExample ? 1 : 0;
const fullCycleCount = Math.floor(ITERATIONS / iterationsPerCycle);
for (let i = 0; i < ITERATIONS; i++) {
  showPerf(1000);
  progress(1000, i, ITERATIONS);
  spawnShape(state);
  dropShape(state);
  if (jetidx === cycleJetIdx && shapeidx === cycleShapeIdx) {
    console.log(
      JSON.stringify({
        cycles,
        fullCycleCount,
        jetidx,
        shapeidx,
        deltaHeight: state.highest - prevHighest,
        deltaIteration: i - prevIter,
      })
    );

    const iterationsRemaining = ITERATIONS - i;
    const skipCycles = Math.floor(iterationsRemaining / iterationsPerCycle);
    const skippedCycleHeight = skipCycles * heightDeltaPerCycle;
    state.highest += skippedCycleHeight;
    state.offsety -= skippedCycleHeight;
    i += skipCycles * iterationsPerCycle;
    prevHighest = state.highest;
    prevIter = i;
    cycles++;
  }
  // console.log(i);
  // printGrid(state);
}

// after some testing, each time itemidx === 1 there have been 1725 iterations with a delta height of 2659

console.log(
  JSON.stringify({
    cycles,
    fullCycleCount,
    jetidx,
    shapeidx,
    deltaHeight: state.highest - prevHighest,
    deltaIteration: ITERATIONS - prevIter,
  })
);
console.log({ jets: jets.length, height: Math.abs(state.highest) });
console.log(`CycleCount [${fullCycleCount}] * HeightPerIteration [${heightDeltaPerCycle}] = ${fullCycleCount * heightDeltaPerCycle}`);
