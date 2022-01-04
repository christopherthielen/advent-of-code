import { permutations, readLines, uniqR } from "../util";

const lines = readLines("input.txt");
const segments = lines.map((raw) => {
  const [segment, cost] = raw.split(" = ");
  const [from, to] = segment.split(" to ");
  return { from, to, cost: parseInt(cost, 10) };
});

const costs: { [node: string]: { [node: string]: number } } = {};
segments.forEach((s) => {
  const from = (costs[s.from] = costs[s.from] ?? {});
  const to = (costs[s.to] = costs[s.to] ?? {});
  from[s.to] = s.cost;
  to[s.from] = s.cost;
});

const nodes = segments
  .map((s) => [s.to, s.from])
  .flat()
  .reduce(uniqR, []);

let best = [[], 0];
permutations(nodes).forEach((nodes) => {
  const cost = nodes.reduce((acc, node, idx) => {
    const hopCost = costs[node][nodes[idx + 1]];
    return hopCost ? acc + hopCost : acc;
  }, 0);
  if (cost > best[1]) {
    best = [nodes, cost];
  }
});

console.log(best);
