import * as fs from "fs";
import * as path from "path";
import assert = require("node:assert");

const inputPath = path.resolve(__dirname, "input.txt");

const DEBUG = 0;

function debug(...args: string[]) {
  if (DEBUG >= 1) console.log(...args);
}

function debug2(...args: string[]) {
  if (DEBUG >= 2) console.log(...args);
}

const lines = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x);

interface Node {
  parent: Node;
  l: Node | number;
  r: Node | number;
}

function node(parent?: Node, l: number = null, r: number = null) {
  return { parent, l, r } as Node;
}

function parseLine(line: string) {
  // console.log({ line });
  const root: Node = node();
  let current = root;
  const chars = line.split("");
  assert(chars[0] === "["); // all lines start with an open bracket
  for (let i = 1; i < line.length; i++) {
    const char = chars[i];
    if (char === "[") {
      if (current.l === null) {
        current.l = node(current);
        current = current.l;
      } else {
        current.r = node(current);
        current = current.r;
      }
    } else if (char === "]") {
      current = current.parent;
    } else if (char.match(/[0-9]/)) {
      if (current.l === null) {
        current.l = parseInt(char, 10);
      } else {
        current.r = parseInt(char, 10);
      }
    }
  }
  return root;
}

interface Visitor {
  enter(node: Node);

  mid(node: Node);

  exit(node: Node);

  done();
}

const isNode = (x): x is Node => typeof x !== "number" && x !== null;

function walk(node: Node, visitor: Visitor) {
  _walk(node, visitor);
  return visitor.done();
}

function _walk(node: Node, visitor: Visitor) {
  visitor.enter(node);
  if (isNode(node.l)) _walk(node.l, visitor);
  visitor.mid(node);
  if (isNode(node.r)) _walk(node.r, visitor);
  visitor.exit(node);
}

class VToString implements Visitor {
  acc = "";

  enter(n) {
    this.acc += "[";
    if (typeof n.l === "number") this.acc += n.l;
  }

  mid(n) {
    this.acc += ",";
  }

  exit(n) {
    if (typeof n.r === "number") this.acc += n.r;
    this.acc += "]";
  }

  done() {
    return this.acc;
  }
}

const nodeDepth = (n: Node) => (n.parent ? nodeDepth(n.parent) + 1 : 0);
const rootNode = (n: Node) => (n.parent ? rootNode(n.parent) : n);
const isNum = (x: any): x is number => typeof x === "number";

class VExplode implements Visitor {
  flat = [];
  found: Node = null;
  enter = (n) => (this.found = this.found ?? (nodeDepth(n) === 4 ? n : this.found));
  mid = (n) => this.flat.push(n);
  exit = (n) => {};
  done = () => {
    const boom = this.found;
    if (!boom) {
      return false;
    }

    assert(typeof boom.l === "number");
    assert(typeof boom.r === "number");

    const boomIdx = this.flat.indexOf(boom);
    // prettier-ignore
    const lnode = this.flat.slice(0, boomIdx).reverse().find((n) => isNum(n.l) || isNum(n.r));
    const rnode = this.flat.slice(boomIdx + 1).find((n) => isNum(n.l) || isNum(n.r));

    if (lnode && isNum(lnode.r)) {
      lnode.r = lnode.r + boom.l;
    } else if (lnode && isNum(lnode.l)) {
      lnode.l = lnode.l + boom.l;
    }

    if (rnode && isNum(rnode.l)) {
      rnode.l = rnode.l + boom.r;
    } else if (rnode && isNum(rnode.r)) {
      rnode.r = rnode.r + boom.r;
    }

    if (boom.parent.l === boom) {
      boom.parent.l = 0;
    } else if (boom.parent.r === boom) {
      boom.parent.r = 0;
    }

    debug2("Boom! " + render(rootNode(boom)));

    return true;
  };
}

const isTen = (x: any): x is number => isNum(x) && x >= 10;

class VSplit implements Visitor {
  split: Node = null;
  mid = (n) => (this.split = this.split ?? (isTen(n.l) || isTen(n.r) ? n : this.split));
  enter = () => {};
  exit = () => {};
  done = () => {
    if (!this.split) return false;
    const { r, l } = this.split;
    if (isTen(l)) {
      this.split.l = node(this.split, Math.floor(l / 2), Math.ceil(l / 2));
    } else if (isTen(r)) {
      this.split.r = node(this.split, Math.floor(r / 2), Math.ceil(r / 2));
    }
    debug2("Split " + render(rootNode(this.split)));
    return true;
  };
}

function process(node: Node) {
  while (walk(node, new VExplode())) {}
  if (walk(node, new VSplit())) {
    process(node);
  }
}

const magnitude = (n: Node | number) => (isNum(n) ? (n as number) : 3 * magnitude(n.l) + 2 * magnitude(n.r));
const render = (node: Node) => walk(node, new VToString());

// lines.forEach((line) => console.log(`${line} becomes ${magnitude(parseLine(line))}`));

const first = parseLine(lines.shift());
const result = lines.reduce((acc: Node, line) => {
  const right = parseLine(line);
  const leftNumStr = render(acc);
  const rightNumStr = render(right);

  const newRoot = (right.parent = acc.parent = node(undefined));
  newRoot.l = acc;
  newRoot.r = right;

  debug("Input " + render(newRoot));
  process(newRoot);

  const addedNumStr = render(newRoot);

  debug("  " + leftNumStr);
  debug("+ " + rightNumStr);
  debug("= " + addedNumStr);
  debug();

  return acc.parent;
}, first);

console.log(magnitude(result));
