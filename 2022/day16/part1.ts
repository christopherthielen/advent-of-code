import { memoize } from "lodash";
import { PERF, perf, showPerf } from "../perf";
import { readLines, toInt } from "../util";

PERF.enabled = true;
const TICKS = 30;
// const INPUT = "example.txt";
const INPUT = "input.txt";

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
  pos: ValveInfo;
  unopened: ValveInfo[];
};

const start: Context = {
  time: 0,
  totalFlow: 0,
  pos: startValve,
  unopened: valves.filter((x) => x !== startValve),
};

const flowRate = function flowRate(valve: ValveInfo, time: number) {
  return Math.max(0, valve.flow * (TICKS - time - 1));
};

const without = <T>(items: T[], item: T) => items.filter((x) => x !== item);
const next = perf(function next(context: Context): Context[] {
  const { time, pos, totalFlow, unopened } = context;
  const openValve = () => ({
    time: time + 1,
    totalFlow: totalFlow + flowRate(pos, time),
    pos,
    unopened: without(unopened, pos),
  });
  const moves: Context[] = pos.neighbors.map((valve) => {
    return { time: time + 1, totalFlow, pos: valve, unopened };
  });
  return unopened.includes(pos) ? moves.concat(openValve()) : moves;
});

let best: Context = { ...start, time: 30, totalFlow: 0 };
const setBest = (newBest: Context) => {
  best = newBest;
  console.log({ best: best.totalFlow });
};

const makeCacheKey = (pos: ValveInfo, unopened: ValveInfo[], time: number) => {
  return `${pos.name} ${unopened.map((v) => v.name).join(",")} ${time}`;
};

const theoreticalMaxScoreRemaining = perf(
  memoize(
    (context: Context) => {
      const ticksRemaining = TICKS - context.time;
      const scores = context.unopened
        .map((v) => {
          return v.flow * Math.max(0, TICKS - context.time - context.pos.distance[v.name] - 1);
        })
        .sort()
        .slice(0 - ticksRemaining);
      return scores.reduce((acc, x) => acc + x, 0);
    },
    (context) => makeCacheKey(context.pos, context.unopened, context.time)
  ),
  "tmsr"
);

const stack = [start];
while (stack.length) {
  showPerf(10000);
  const moves = next(stack.pop());
  moves.forEach((result) => {
    const resultScore = result.totalFlow;
    if (result.time >= TICKS) {
      if (result.totalFlow > best.totalFlow) {
        setBest(result);
      }
    } else {
      if (resultScore + theoreticalMaxScoreRemaining(result) > best.totalFlow) {
        stack.push(result);
      } else {
      }
    }
  });
}

console.log({ bestest: best.totalFlow });
