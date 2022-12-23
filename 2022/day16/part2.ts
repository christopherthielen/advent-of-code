import { groupBy } from "lodash";
import * as yargs from "yargs";
import { PERF, perf } from "../perf";
import { CounterTimer, lpad, range, readLines, toInt, without } from "../util";

["perf", "example", "printroutes"].forEach((opt) => yargs.option(opt, { boolean: true }));
PERF.enabled = !!yargs.argv["perf"];
const TICKS = 26;
const INPUT = yargs.argv["example"] ? "example.txt" : "input.txt";

type Valve = { id: number; name: string; flowPerMin: number; neighbors: Valve[] };
type Distances = { [from: string]: { [to: string]: number } };

const parseLine = (line: string, idx: number): Valve & { rawNeighbors: string[] } => {
  // Valve AA has flow rate=0; tunnels lead to valves RZ, QQ, FH, IM, VJ
  const regExp = /Valve ([A-Z]+) has flow rate=(\d+); tunnels? leads? to valves? (.*)/;
  const [_, valveName, flow, otherValves] = regExp.exec(line);
  return {
    id: Math.pow(2, idx),
    name: valveName,
    flowPerMin: toInt(flow),
    neighbors: [],
    rawNeighbors: otherValves.split(", "),
  };
};

const loadValves = (): Valve[] => {
  const valves = readLines(INPUT).map((line, idx) => parseLine(line, idx));
  // link to other Valve objects
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

const routeScore = perf((route: Valve[]) => {
  return route.reduce(
    (acc, valve, idx) => {
      const distance = distances[acc.last.name][valve.name];
      const elapsed = distance + (idx === 0 ? 0 : 1);
      const flow = acc.flow + flowRate(valve, acc.time + elapsed);
      return { last: valve, time: acc.time + elapsed, flow };
    },
    { last: route[0], time: 0, flow: 0 }
  ).flow;
}, "routeScore");

type Route = { valves: Valve[]; mask: number; desc: string; score: number };
const routeDesc = (route: Valve[]) => route.map((v) => v.name).join(" -> ");
// Returns true if the dest valve is reachable (and can be opened) within timeRemaining ticks
const isReachable = (src: Valve, dest: Valve, timeRemaining: number) => distances[src.name][dest.name] < timeRemaining + 1;
const flowRate = (valve: Valve, time: number) => Math.max(0, valve.flowPerMin * (TICKS - time));
const allPaths = (start: Valve, unopened: Valve[], timeRemaining: number): Valve[][] => {
  const getChildRoutes = (v) => allPaths(v, without(unopened, v), timeRemaining - distances[start.name][v.name] + 1);
  const nonTerminal = unopened.filter((v) => isReachable(start, v, timeRemaining));
  const routes = nonTerminal
    .map(getChildRoutes)
    .flat()
    .map((childRoute) => [start, ...childRoute]);
  return [[start], ...routes];
};

const routeToString = (r: Route) => `${lpad(nonZeroValves.length + 6, r.mask.toString(2), "0")} ${lpad(5, "" + r.score)} ${r.desc}: `;
const makeMask = (valves: Valve[]) => valves.reduce((acc, x) => acc | x.id, 0);
const makeRoute = (valves: Valve[]): Route => ({
  mask: makeMask(valves),
  valves,
  desc: routeDesc(valves),
  score: routeScore(valves),
});

// ------------------------------------------------------------------------------

const valves = loadValves();
const nonZeroValves = valves.filter((v) => v.flowPerMin > 0);
const distances = computeDistances(valves);
const startValve: Valve = valves.find((v) => v.name === "AA");
const rawRoutes: Route[] = allPaths(startValve, nonZeroValves, TICKS)
  .map(makeRoute)
  .sort((a, b) => a.mask - b.mask);
const routes = Object.values(groupBy(rawRoutes, (r) => r.mask)).map((routesForMask) => {
  return routesForMask.reduce((acc, x) => (acc && acc.score > x.score ? acc : x));
});
if (yargs.argv["printroutes"]) routes.forEach((route) => console.log(routeToString(route)));
console.log(`${rawRoutes.length} raw routes`);
console.log(`${routes.length} uniq routes`);

const counter = new CounterTimer(5000);
const candidates = routes.map((route) => {
  counter.count("route");
  const maskAA = ~startValve.id;
  const otherRoutes = routes.filter((other) => (maskAA & other.mask & route.mask) === 0);
  const best = otherRoutes.reduce((acc, x) => (acc && acc.score > x.score ? acc : x), null);
  return [route, best];
});

const [best1, best2] = candidates.reduce((acc, x) => {
  return acc && acc[0].score + acc[1].score > x[0].score + x[1].score ? acc : x;
});

console.log(lpad(10, best1.score.toString()), best1.desc);
console.log(lpad(10, best2.score.toString()), best2.desc);
console.log(lpad(10, (best1.score + best2.score).toString()));
