import { readLines, splitArray, toInt } from "../util";

const lines = readLines("input.txt", false);
const chunks = splitArray(lines, (line) => line.length === 0).filter((array) => array.length);

type Monkey = {
  id: number;
  items: number[];
  op: "*" | "+";
  arg: string;
  divisibleBy: number;
  trueDest: number;
  falseDest: number;
  inspectionCount: number;
};

const parseMonkey = (lines: string[]): Monkey => {
  const [_1, id] = /Monkey (\d+):/.exec(lines[0]);
  const [_2, itemsString] = /Starting items: (.*)/.exec(lines[1]);
  const [_3, op, arg] = /  Operation: new = old ([\*\+]) (.*)/.exec(lines[2]);
  const [_4, test] = /Test: divisible by (\d+)/.exec(lines[3]);
  const [_5, condition1] = /If true: throw to monkey (\d+)/.exec(lines[4]);
  const [_6, condition2] = /If false: throw to monkey (\d+)/.exec(lines[5]);

  return {
    id: toInt(id),
    items: itemsString.split(", ").map(toInt),
    op: op as "*" | "+",
    arg,
    divisibleBy: toInt(test),
    trueDest: toInt(condition1),
    falseDest: toInt(condition2),
    inspectionCount: 0,
  };
};

const monkeys = chunks.map(parseMonkey);

const worry = (item: number, op: "*" | "+", argString: string | "old") => {
  const arg = argString === "old" ? item : toInt(argString);
  if (op === "*") {
    return item * arg;
  } else if (op === "+") {
    return item + arg;
  }
};

const round = () => {
  monkeys.forEach((monkey) => {
    const { op, arg, items, divisibleBy, trueDest, falseDest } = monkey;
    items.forEach((item) => {
      let newWorry = Math.floor(worry(item, op, arg) / 3);
      const dest = newWorry % divisibleBy === 0 ? trueDest : falseDest;
      const destMonkey = monkeys.find((monkey) => monkey.id === dest);
      destMonkey.items.push(newWorry);
      monkey.inspectionCount++;
    });
    items.splice(0);
  });
};
new Array(20).fill(0).forEach(() => round());

monkeys.sort((a, b) => a.inspectionCount - b.inspectionCount);
const active = monkeys.slice(-2);
const monkeybusiness = active.reduce((acc, x) => acc * x.inspectionCount, 1);
console.log(monkeybusiness);
