import { readLines, splitArray, toInt } from "../util";

const lines = readLines("input.txt", false);
const chunks = splitArray(lines, (line) => line.length === 0).filter((array) => array.length);

type Item = {
  [key: number]: number;
};

type Monkey = {
  id: number;
  items: Item[];
  itemsRaw: number[];
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
    items: null,
    itemsRaw: itemsString.split(", ").map((str) => toInt(str)),
    op: op as "*" | "+",
    arg,
    divisibleBy: toInt(test),
    trueDest: toInt(condition1),
    falseDest: toInt(condition2),
    inspectionCount: 0,
  };
};

const monkeys = chunks.map(parseMonkey);
const divisibleByList = monkeys.map((m) => m.divisibleBy);
monkeys.forEach((monkey) => {
  monkey.items = monkey.itemsRaw.map((itemWorry) => {
    const item: Item = {};
    divisibleByList.forEach((divisibleBy) => {
      item[divisibleBy] = itemWorry % divisibleBy;
    });
    return item;
  });
});

const updateWorry = (item: Item, op: "*" | "+", argString: string | "old") => {
  Object.entries(item).forEach(([key, val]) => {
    const arg = argString === "old" ? val : toInt(argString);
    if (op === "*") {
      item[key] = (item[key] * arg) % toInt(key);
    } else if (op === "+") {
      item[key] = (item[key] + arg) % toInt(key);
    }
  });
};

const round = () => {
  monkeys.forEach((monkey) => {
    const { op, arg, items, divisibleBy, trueDest, falseDest } = monkey;
    items.forEach((item) => {
      updateWorry(item, op, arg);
      const dest = item[divisibleBy] === 0 ? trueDest : falseDest;
      const destMonkey = monkeys.find((monkey) => monkey.id === dest);
      destMonkey.items.push(item);
      monkey.inspectionCount++;
    });
    items.splice(0);
  });
};

new Array(10000).fill(0).forEach(() => round());
monkeys.forEach((m) => console.log(m.id, m.inspectionCount));

monkeys.sort((a, b) => a.inspectionCount - b.inspectionCount);
const active = monkeys.slice(-2);
const monkeybusiness = active.reduce((acc, x) => acc * x.inspectionCount, 1);
console.log("---", monkeybusiness, "---");
