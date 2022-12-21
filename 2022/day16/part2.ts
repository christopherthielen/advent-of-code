import { memoize } from "lodash";
import { PERF, perf, showPerf } from "../perf";
import { product, readLines, toInt } from "../util";
import * as yargs from "yargs";

yargs.option("perf", { boolean: true });
yargs.option("example", { boolean: true });

PERF.enabled = !!yargs.argv.perf;
const TICKS = 26;
// const TICKS = 30;
const INPUT = yargs.argv.example ? "example.txt" : "input.txt";

type ValveInfo = {
  name: string;
  flow: number;
  neighbors: ValveInfo[];
  distance: { [key: string]: number };
};

const parseLine = (line: string): ValveInfo & { rawNeighbors: string[] } => {
  // Valve AA has flow rate=0; tunnels lead to valves RZ, QQ, FH, IM, VJ
  const regExp = /Valve ([A-Z]+) has flow rate=(\d+); tunnels? leads? to valves? (.*)/;
  const [_, valve, flow, otherValves] = regExp.exec(line);
  return { name: valve, flow: toInt(flow), neighbors: [], rawNeighbors: otherValves.split(", "), distance: {} };
};

const calculateDistances = (valves: ValveInfo[]) => {
  valves.forEach((v) => {
    v.distance = Object.fromEntries(v.neighbors.map((n) => [n.name, 1]));
    v.distance[v.name] = 0;
  });

  valves.forEach(() => {
    valves.forEach((v) => {
      v.neighbors.forEach((n) => {
        Object.keys(n.distance).forEach((key) => {
          v.distance[key] = Math.min(v.distance[key] ?? Number.MAX_SAFE_INTEGER, n.distance[key] + 1);
        });
      });
    });
  });
};

const valves = readLines(INPUT)
  .map((line) => parseLine(line))
  .sort((a, b) => b.flow - a.flow);

valves.forEach((valve) => {
  valve.neighbors = valve.rawNeighbors.map((n) => valves.find((v2) => v2.name === n));
  delete valve.rawNeighbors;
});
calculateDistances(valves);
const startValve: ValveInfo = valves.find((v) => v.name === "AA");

type Context = {
  time: number;
  totalFlow: number;
  pos1: ValveInfo;
  pos2: ValveInfo;
  unopened: ValveInfo[];
};

const start: Context = {
  time: 0,
  totalFlow: 0,
  pos1: startValve,
  pos2: startValve,
  unopened: valves.filter((x) => x !== startValve),
};

const flowRate = (valve: ValveInfo, time: number) => Math.max(0, valve.flow * (TICKS - time));
const without = <T>(items: T[], item: T) => items.filter((x) => x !== item);

const next = perf(function next(context: Context): Context[] {
  const { pos1, pos2 } = context;
  const time = context.time + 1;
  const moves1 = context.unopened.includes(pos1) ? [...pos1.neighbors, pos1] : pos1.neighbors;
  const moves2 = context.unopened.includes(pos2) && pos1 !== pos2 ? [...pos2.neighbors, pos2] : pos2.neighbors;

  const result: Context[] = [];
  moves1.forEach((move1) => {
    moves2.forEach((move2) => {
      if (move1 === pos1 && move2 === pos2) {
        // both opening different valves
        const unopened = without(without(context.unopened, pos1), pos2);
        const totalFlow = context.totalFlow + flowRate(pos1, time) + flowRate(pos2, time);
        result.push({ time, pos1, pos2, unopened, totalFlow });
      } else if (move1 === pos1) {
        // human opening valve, elephant moving
        const unopened = without(context.unopened, pos1);
        const totalFlow = context.totalFlow + flowRate(pos1, time);
        result.push({ time, pos1: move1, pos2: move2, unopened, totalFlow });
      } else if (move2 === pos2) {
        // elephant opening valve, human moving
        const unopened = without(context.unopened, pos2);
        const totalFlow = context.totalFlow + flowRate(pos2, time);
        result.push({ time, pos1: move1, pos2: move2, unopened, totalFlow });
      } else {
        // both moving
        const { unopened, totalFlow } = context;
        result.push({ time, pos1: move1, pos2: move2, unopened, totalFlow });
      }
    });
  });
  return result;
  // return product(moves1, moves2).map(([move1, move2]) => {
});

let best: Context = { ...start, time: TICKS, totalFlow: 0 };
const setBest = (newBest: Context) => {
  best = newBest;
  console.log({ best: best.totalFlow });
};

const theoreticalMaxScoreRemaining = perf((context: Context) => {
  const ticksRemaining = TICKS - context.time;
  const scores = context.unopened
    .map((v) => {
      // best case flow for unopened v if human opens valve
      const flow1 = v.flow * Math.max(0, TICKS - context.time - v.distance[context.pos1.name] - 1);
      // best case flow for unopened v if elephant opens valve
      const flow2 = v.flow * Math.max(0, TICKS - context.time - v.distance[context.pos2.name] - 1);
      return Math.max(flow1, flow2);
    })
    .sort()
    .slice(0 - Math.ceil(ticksRemaining / 2));

  return scores.reduce((acc, x) => acc + x, 0);
}, "tmsr");

const iterate = perf(function iterate() {
  showPerf(10000);
  const context = stack.pop();
  // const skipRemaining = context.totalFlow + theoreticalMaxScoreRemaining(context) < best.totalFlow;
  const moves = next(context);
  moves.forEach((result) => {
    if (result.totalFlow > best.totalFlow) {
      setBest(result);
    }
    if (result.time < TICKS) {
      stack.push(result);
    }
  });
});

const stack = [start];
while (stack.length) {
  iterate();
}

console.log({ bestest: best.totalFlow });
