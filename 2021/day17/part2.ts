import * as fs from "fs";
import { range } from "lodash";
import * as path from "path";

const inputPath = path.resolve(__dirname, "input.txt");

const lines = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x);

const [_match, ...groups] = /target area: x=([-\d]+)\.\.([-\d]+), y=([-\d]+)\.\.([-\d]+)/.exec(lines[0]);
const [x1, x2, y1, y2] = groups.map((x) => parseInt(x, 10));

console.log({ x1, x2, y1, y2 });
type Coord = [number, number];

const hit = ([x, y]: Coord) => x >= x1 && x <= x2 && y >= y1 && y <= y2;

function yafter(yv: number, steps: number) {
  let y = 0;
  for (let s = 0; s < steps; s++) {
    y += yv - (steps - 1);
  }
  return y;
}

const getYSteps = (vy: number): number[] => {
  let step = 0;
  let y = 0;

  let matchingSteps = [];
  while (true) {
    step++;
    y += vy;
    vy = vy - 1;

    if (hit([x1, y])) {
      matchingSteps.push(step);
    }

    if (y < y1) {
      return matchingSteps;
    }
  }
};

const getXPredicate = (vx: number) => {
  let step = 0;
  let x = 0;

  let matchingSteps = [];
  let infinity = false;

  const predicate = (step: number) => {
    return matchingSteps.includes(step) || (matchingSteps.length && infinity && step >= matchingSteps[matchingSteps.length - 1]);
  };

  while (true) {
    step++;
    x += vx;
    vx = Math.max(0, vx - 1);

    if (hit([x, y1])) {
      matchingSteps.push(step);
    }

    if (vx === 0) {
      infinity = true;
      return matchingSteps.length ? predicate : null;
    } else if (x > x2) {
      return matchingSteps.length ? predicate : null;
    }
  }
};

const xvPredicates = range(0, x2 + 1)
  .map((xv) => ({ xv, predicate: getXPredicate(xv) }))
  .filter((xv) => xv.predicate !== null);
const yvRange = range(0 - Math.abs(y1) - 1, Math.abs(y1) + 1);

const velocities = yvRange
  .map((yv) => {
    const steps = getYSteps(yv);
    if (!steps.length) {
      return [];
    }

    const xv = xvPredicates.filter(({ xv, predicate }) => {
      // console.log({ xv, yv, steps });
      return steps.some((step) => predicate(step));
    });

    return xv.map((xv) => ({ xv: xv.xv, yv }));
  })
  .flat();

console.log(velocities.length);
console.log({ velocities });
