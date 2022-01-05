import { range, readLines } from "../util";

class Node {
  constructor(public on: boolean) {}

  n: Node;
  e: Node;
  w: Node;
  s: Node;
  ne: Node;
  nw: Node;
  se: Node;
  sw: Node;

  get neighbors(): Node[] {
    const { n, e, w, s, ne, nw, se, sw } = this;
    return [n, e, w, s, ne, nw, se, sw].filter((x) => x);
  }

  get oncount(): number {
    return this.neighbors.filter((n) => n.on).length;
  }
}

const lines = readLines("input.txt");
const grid = lines.map((line) => line.split("").map((char) => new Node(char === "#")));
grid.forEach((line, y) => {
  line.forEach((node, x) => {
    node.n = grid[y - 1]?.[x];
    node.ne = grid[y - 1]?.[x + 1];
    node.e = grid[y]?.[x + 1];
    node.se = grid[y + 1]?.[x + 1];
    node.s = grid[y + 1]?.[x];
    node.sw = grid[y + 1]?.[x - 1];
    node.w = grid[y]?.[x - 1];
    node.nw = grid[y - 1]?.[x - 1];
  });
});

const dump = () => {
  const string = grid.map((line) => line.map((n) => (n.on ? "#" : ".")).join("")).join("\n");
  console.log(string);
  console.log();
};

const step = () => {
  const toggleoff = grid.flat().filter((n) => n.on && ![2, 3].includes(n.oncount));
  const toggleon = grid.flat().filter((n) => !n.on && n.oncount === 3);
  toggleoff.forEach((n) => (n.on = false));
  toggleon.forEach((n) => (n.on = true));
};

range(0, 99).forEach(() => {
  step();
});

const count = grid.flat().filter((n) => n.on).length;
console.log({ count });
