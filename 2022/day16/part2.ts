import { PERF, perf, showPerf } from "../perf";
import { PQ } from "../priorityQueue";
import { range, readLines, toInt, without } from "../util";
import * as yargs from "yargs";

yargs.option("perf", { boolean: true }).option("example", { boolean: true });

PERF.enabled = !!yargs.argv["perf"];
const TICKS = 26;
const INPUT = yargs.argv["example"] ? "example.txt" : "input.txt";

type ValveInfo = {
  name: string;
  flowPerMin: number;
  neighbors: ValveInfo[];
  distance: { [key: string]: number };
  tmax: { [dest: string]: number[] };
};

const parseLine = (line: string): ValveInfo & { rawNeighbors: string[] } => {
  // Valve AA has flow rate=0; tunnels lead to valves RZ, QQ, FH, IM, VJ
  const regExp = /Valve ([A-Z]+) has flow rate=(\d+); tunnels? leads? to valves? (.*)/;
  const [_, valve, flow, otherValves] = regExp.exec(line);
  return {
    name: valve,
    flowPerMin: toInt(flow),
    neighbors: [],
    rawNeighbors: otherValves.split(", "),
    distance: {},
    tmax: {},
  };
};

const loadValves = (): ValveInfo[] => {
  const valves = readLines(INPUT)
    .map((line) => parseLine(line))
    .sort((a, b) => b.flowPerMin - a.flowPerMin);

  // link to other ValveInfo objects
  valves.forEach((valve) => {
    valve.neighbors = valve.rawNeighbors.map((n) => valves.find((v2) => v2.name === n));
    delete valve.rawNeighbors;
  });

  // compute distances between all valves
  valves.forEach((v) => {
    v.distance = Object.fromEntries(v.neighbors.map((n) => [n.name, 1]));
    v.distance[v.name] = 0;
  });

  // compute distances between all valves
  valves.forEach(() => {
    valves.forEach((v) => {
      v.neighbors.forEach((n) => {
        Object.keys(n.distance).forEach((key) => {
          v.distance[key] = Math.min(v.distance[key] ?? Number.MAX_SAFE_INTEGER, n.distance[key] + 1);
        });
      });
    });
  });

  // compute theoretical maximum flow for each valve if move from src to target with time remaining
  valves.forEach((src) => {
    valves.forEach((target) => {
      src.tmax[target.name] = range(0, TICKS).map((time) => {
        return target.flowPerMin * Math.max(0, TICKS - time - src.distance[target.name] - 1);
      });
    });
  });

  return valves;
};

const valves = loadValves();

const bestPossibleFlowForValve = perf((dest: ValveInfo, src1: ValveInfo, src2: ValveInfo, time: number) => {
  // best case flow for unopened v if human or elephant moves from their current pos and opens valve
  return Math.max(src1.tmax[dest.name][time], src2.tmax[dest.name][time]);
}, "bpffv");

const tmax = perf((currentFlow: number, time: number, unopened: ValveInfo[], src1: ValveInfo, src2: ValveInfo) => {
  const scores = unopened.map((v) => bestPossibleFlowForValve(v, src1, src2, time)).sort((a, b) => a - b);
  return scores.slice((0 - TICKS - time) / 2).reduce((acc, x) => acc + x, 0) + currentFlow;
}, "tmax");

type Context = {
  time: number;
  totalFlow: number;
  theoreticalMax: number;
  pos1: ValveInfo;
  pos2: ValveInfo;
  unopened: ValveInfo[];
};

const startValve: ValveInfo = valves.find((v) => v.name === "AA");
const start: Context = {
  time: 0,
  totalFlow: 0,
  theoreticalMax: 0,
  pos1: startValve,
  pos2: startValve,
  unopened: valves.filter((x) => x !== startValve && x.flowPerMin > 0),
};
start.theoreticalMax = tmax(start.totalFlow, start.time, start.unopened, start.pos1, start.pos2);

const flowRate = (valve: ValveInfo, time: number) => Math.max(0, valve.flowPerMin * (TICKS - time));

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
        const unopened = without(context.unopened, pos1, pos2);
        const totalFlow = context.totalFlow + flowRate(pos1, time) + flowRate(pos2, time);
        const theoreticalMax = tmax(totalFlow, time, unopened, move1, move2);
        result.push({ time, pos1, pos2, unopened, totalFlow, theoreticalMax });
      } else if (move1 === pos1) {
        // human opening valve, elephant moving
        const unopened = without(context.unopened, pos1);
        const totalFlow = context.totalFlow + flowRate(pos1, time);
        const theoreticalMax = tmax(totalFlow, time, unopened, move1, move2);
        result.push({ time, pos1: move1, pos2: move2, unopened, totalFlow, theoreticalMax });
      } else if (move2 === pos2) {
        // elephant opening valve, human moving
        const unopened = without(context.unopened, pos2);
        const totalFlow = context.totalFlow + flowRate(pos2, time);
        const theoreticalMax = tmax(totalFlow, time, unopened, move1, move2);
        result.push({ time, pos1: move1, pos2: move2, unopened, totalFlow, theoreticalMax });
      } else {
        // both moving
        const { unopened, totalFlow } = context;
        const theoreticalMax = tmax(totalFlow, time, unopened, move1, move2);
        result.push({ time, pos1: move1, pos2: move2, unopened, totalFlow, theoreticalMax });
      }
    });
  });
  return result;
});

let best: Context = { ...start, time: TICKS, totalFlow: 0 };
const setBest = (newBest: Context) => {
  best = newBest;
  console.log({ best: best.totalFlow });
};

const iterate = perf(function iterate() {
  const context = priorityQueue.pop();
  const skipRemaining = context.theoreticalMax <= best.totalFlow;
  const moves = skipRemaining ? [] : next(context);
  const header = () =>
    `${JSON.stringify({
      depth: priorityQueue.length,
      contexttime: context.time,
      tmax: context.theoreticalMax,
      best: best.totalFlow,
    })}`;
  showPerf(10000, header);
  moves.forEach((result) => {
    if (result.totalFlow > best.totalFlow) {
      setBest(result);
    }
    if (result.time < TICKS) {
      priorityQueue.push(result);
    }
  });
});

const contextCompare = (a: Context, b: Context) => {
  return a.time * a.theoreticalMax - b.time * b.theoreticalMax;
};

const priorityQueue = new PQ<Context>(contextCompare);
priorityQueue.push(start);

while (priorityQueue.length) {
  iterate();
}

console.log({ bestest: best.totalFlow });
