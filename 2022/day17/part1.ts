import * as yargs from "yargs";
import { PERF } from "../perf";
import { range, readLines } from "../util";
import { VirtualGrid } from "../virtualgrid";
import { Shape, shapes } from "./shapes";

["perf", "example"].forEach((opt) => yargs.option(opt, { boolean: true }));
PERF.enabled = !!yargs.argv["perf"];

const INPUT = yargs.argv["example"] ? "example.txt" : "input.txt";
const jets = readLines(INPUT)[0].split("");
const grid = new VirtualGrid(() => ".");

const printGrid = (grid: VirtualGrid, shape: Shape) => {
  const gridClone = grid.clone();
  shape.coords.forEach((coord) => gridClone.set(coord.x, coord.y, "@"));
  console.log(gridClone.toString((i) => i.val));
  console.log(gridClone.minX, gridClone.maxX);
};

const makeShapeGen = function* shapeGen(grid: VirtualGrid): Generator<Shape, Shape> {
  let i = 0;
  while (true) {
    yield shapes[i++ % shapes.length](grid);
  }
};
const shapeGen = makeShapeGen(grid);
const nextShape = () => shapeGen.next().value;

type Jet = "<" | ">";

function* makeJetGen(): Generator<Jet, Jet> {
  var i = 0;
  while (true) {
    yield jets[i++ % jets.length] as Jet;
  }
}

const jetGen = makeJetGen();
const nextJet = () => jetGen.next().value;

// ground
range(0, 6).forEach((x) => grid.set(x, 0, "-"));
const ITERATIONS = 8;
// const ITERATIONS = 2022;
for (var i = 0; i < ITERATIONS; i++) {
  dropShape();
  console.log(grid.toString());
  console.log();
}

function dropShape() {
  const shape = nextShape();
  shape.spawn();
  let done = false;
  while (!done) {
    const jet = nextJet();
    shape.handleJet(jet);
    printGrid(grid, shape);
    if (!shape.down()) {
      shape.land();
      done = true;
    }
    printGrid(grid, shape);
  }
}
