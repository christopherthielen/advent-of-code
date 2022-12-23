import { isEqual, uniqBy } from "lodash";
import * as yargs from "yargs";
import { PERF, perf } from "../perf";
import { range, readLines, toInt, without } from "../util";

yargs.option("perf", { boolean: true }).option("example", { boolean: true });

PERF.enabled = !!yargs.argv["perf"];
const TICKS = 26;
const INPUT = yargs.argv["example"] ? "example.txt" : "input.txt";

type Valve = {
  name: string;
  flowPerMin: number;
  neighbors: Valve[];
};

type Distances = {
  [from: string]: {
    [to: string]: number;
  };
};

const parseLine = (line: string): Valve & { rawNeighbors: string[] } => {
  // Valve AA has flow rate=0; tunnels lead to valves RZ, QQ, FH, IM, VJ
  const regExp = /Valve ([A-Z]+) has flow rate=(\d+); tunnels? leads? to valves? (.*)/;
  const [_, valve, flow, otherValves] = regExp.exec(line);
  return {
    name: valve,
    flowPerMin: toInt(flow),
    neighbors: [],
    rawNeighbors: otherValves.split(", "),
  };
};

const loadValves = (): Valve[] => {
  const valves = readLines(INPUT).map((line) => parseLine(line));
  // link to other ValveInfo objects
  valves.forEach((valve) => {
    valve.neighbors = valve.rawNeighbors.map((n) => valves.find((v2) => v2.name === n));
    delete valve.rawNeighbors;
  });
  return valves;
};

const computeDistances = (valves: Valve[]): Distances => {
  const distances: Distances = {};

  valves.forEach((valve) => {
    const dv = (distances[valve.name] = { [valve.name]: 0 });
    valve.neighbors.forEach((neighbor) => (dv[neighbor.name] = 1));
  });

  // compute distances between every pair of valves
  range(0, valves.length).forEach(() => {
    valves.forEach((valve) => {
      const vDistances = distances[valve.name];
      valve.neighbors.forEach((neighbor) => {
        Object.entries(distances[neighbor.name]).forEach(([valveId, nDistanceToValveId]) => {
          const nDistancePlusOne = nDistanceToValveId === Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : nDistanceToValveId + 1;
          vDistances[valveId] = Math.min(vDistances[valveId] ?? Number.MAX_SAFE_INTEGER, nDistancePlusOne);
        });
      });
    });
  });

  return distances;
};

const valves = loadValves();
const distances = computeDistances(valves);
type Context = { time: number; totalFlow: number; pos1: Valve; pos2: Valve; unopened: Valve[] };
const startValve: Valve = valves.find((v) => v.name === "AA");
const start: Context = {
  time: 0,
  totalFlow: 0,
  pos1: startValve,
  pos2: startValve,
  unopened: valves.filter((x) => x.flowPerMin > 0),
};

const routeScore = perf((route: Valve[]) => {
  return route.reduce(
    (acc, valve, idx) => {
      const flow = flowRate(valve, acc.time);
      const distance = distances[acc.last.name][valve.name];
      const elapsed = distance + (idx === 0 ? 0 : 1);
      return { last: valve, time: acc.time - elapsed, flow: acc.flow + flow };
    },
    { last: route[0], time: TICKS, flow: 0 }
  ).flow;
}, "routeScore");

type Route = {
  valves: Valve[];
  desc: string;
  score: number;
};
const routeToString = (route: Valve[]) => route.map((v) => v.name).join(" -> ");
// Returns true if the dest valve is reachable (and can be opened) within timeRemaining ticks
const isReachable = (src: Valve, dest: Valve, timeRemaining: number) => distances[src.name][dest.name] < timeRemaining + 1;
const flowRate = (valve: Valve, time: number) => Math.max(0, valve.flowPerMin * (TICKS - time));
const allPaths = (start: Valve, unopened: Valve[], timeRemaining: number): Valve[][] => {
  const nonTerminal = unopened.filter((v) => isReachable(start, v, timeRemaining));
  if (nonTerminal.length === 0) return [[start]];
  const routes = nonTerminal
    .map((v) => allPaths(v, without(unopened, v), timeRemaining - distances[start.name][v.name] + 1))
    .flat()
    .map((childRoute) => [start, ...childRoute]);
  return routes;
};

const makeRoute = (valves: Valve[]): Route => ({ valves, desc: routeToString(valves), score: routeScore(valves) });
const routes: Route[] = allPaths(start.pos1, start.unopened, TICKS - start.time).map(makeRoute);

routes.forEach((route) => console.log(`${route.desc}: ${route.score}`));

let best: Context = { ...start, time: TICKS, totalFlow: 0 };
const setBest = (newBest: Context) => {
  best = newBest;
  console.log({ best: best.totalFlow });
};

const stack = [];
stack.push(start);
console.log({ bestest: best.totalFlow });
