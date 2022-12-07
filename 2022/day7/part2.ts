import { readLines, toInt } from "../util";

const makeFile = (name: string, parent: Dir, size: number): File => ({
  type: "file",
  name,
  parent,
  level: parent?.level + 1 ?? 0,
  size,
});
const makeDir = (name: string, parent: Dir): Dir => ({
  type: "dir",
  name,
  parent,
  level: parent?.level + 1 ?? 0,
  children: [],
});

const ROOT = makeDir("/", null);
const nodes: Node[] = [ROOT];
let currentDir: Dir = ROOT;

const visitLine = (line: string) => {
  if (line.startsWith("$")) {
    const [_, command, dir] = /^\$ (cd|ls)(?:[ ]+)?(.*)?/.exec(line);
    if (command === "cd" && dir === "/") {
      currentDir = ROOT;
    } else if (command === "cd" && dir === "..") {
      currentDir = currentDir.parent;
    } else if (command === "cd") {
      currentDir = currentDir.children.find((c) => c.name === dir.trim() && c.type === "dir") as Dir;
    } else {
      // begin listing; NOOP
    }
  } else {
    const [_, size, name] = /^(dir|\d+) (.*)$/.exec(line);
    if (size === "dir") {
      let dir = makeDir(name, currentDir);
      currentDir.children.push(dir);
      nodes.push(dir);
    } else {
      let file = makeFile(name, currentDir, toInt(size));
      currentDir.children.push(file);
      nodes.push(file);
    }
  }
};

type Dir = { level: number; name: string; type: "dir"; parent: Dir; children: Node[] };
type File = { level: number; name: string; type: "file"; parent: Dir; size: number };
type Node = Dir | File;

const lines = readLines("input.txt");
lines.forEach(visitLine);

function getSize(node: Dir) {
  return node.children.reduce((acc, n) => {
    return acc + (n.type === "dir" ? getSize(n as Dir) : n.type === "file" ? n.size : 0);
  }, 0);
}

const totalspace = 70000000;
const usedBytes = getSize(ROOT);
const totalFree = totalspace - usedBytes;
const desiredFree = 30000000;
const freeupthismuch = desiredFree - totalFree;

const smallesmatching = nodes
  .filter((node) => node.type === "dir" && getSize(node) >= freeupthismuch)
  .reduce((smallest, node) => {
    if (!smallest) {
      return node;
    }
    return getSize(node as Dir) < getSize(smallest as Dir) ? node : smallest;
  }, null);

console.log(getSize(smallesmatching as Dir));
