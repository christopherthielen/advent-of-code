import * as yargs from "yargs";
import { perf, showPerf } from "../perf";
import { range, readLines } from "../util";
import { VirtualGrid } from "../virtualgrid";
import { Shape, shapes } from "./shapes";

["perf", "example"].forEach((opt) => yargs.option(opt, { boolean: true }));

const INPUT = yargs.argv["example"] ? "example.txt" : "input.txt";
const jets = readLines(INPUT)[0].split("");
const grid = new VirtualGrid(() => ".");

// const printGrid = perf((grid: VirtualGrid, shape: Shape) => {
//   const gridClone = grid.clone();
//   shape.coords.forEach((coord) => gridClone.set(coord.x, coord.y, "@"));
//   console.log(gridClone.toString((i) => i.val));
//   console.log(gridClone.minX, gridClone.maxX);
// }, "printGrid");

const makeShapeGen = function* shapeGen(grid: VirtualGrid): Generator<Shape, Shape> {
  let i = 0;
  while (true) {
    yield shapes[i++ % shapes.length](grid);
  }
};
const shapeGen = makeShapeGen(grid);
const nextShape = perf(() => shapeGen.next().value, "nextShape");

type Jet = "<" | ">";

function* makeJetGen(): Generator<Jet, Jet> {
  let i = 0;
  while (true) {
    yield jets[i++ % jets.length] as Jet;
  }
}

const jetGen = makeJetGen();
const nextJet = perf(() => jetGen.next().value, "nextJet");


const dropShape = perf(function dropShape() {
  const shape = nextShape();
  shape.spawn();
  let done = false;
  while (!done) {
    const jet = nextJet();
    shape.handleJet(jet);
    // printGrid(grid, shape);
    if (!shape.down()) {
      shape.land();
      done = true;
    }
    // printGrid(grid, shape);
  }
});

range(0, 6).forEach((x) => grid.set(x, 0, "-")); // add the ground
const ITERATIONS = 2022;
for (let i = 0; i < ITERATIONS; i++) {
  showPerf(1000);
  dropShape();
  console.log(i);
}
console.log({ height: Math.abs(grid.minY) });

