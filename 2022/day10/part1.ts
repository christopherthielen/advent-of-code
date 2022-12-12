import { readLines, toInt } from "../util";

const PARSE_OPS = {
  addx: (arg: string) => new Addx(toInt(arg)),
  noop: () => new Noop(),
};

class Context {
  cycle = 0;
  register = 1;
  signals: number[] = [1];
}

interface Operation {
  execute(context: Context): void;
}

class Addx implements Operation {
  constructor(public arg: number) {}

  execute(context: Context) {
    context.cycle += 2;
    context.signals.push(context.register);
    context.register += this.arg;
    context.signals.push(context.register);
  }
}

class Noop implements Operation {
  execute(context: Context) {
    context.cycle += 1;
    context.signals.push(context.register);
  }
}

const ops = readLines("input.txt").map((line) => {
  const [op, arg] = line.split(" ");
  return PARSE_OPS[op](arg) as Operation;
});

const context = new Context();

console.log({ ops });
ops.forEach((op) => op.execute(context));

const total = [20, 60, 100, 140, 180, 220].reduce((acc, idx) => {
  console.log(idx, context.signals[idx - 1]);
  const strength = context.signals[idx - 1];
  return acc + idx * strength;
}, 0);

console.log(JSON.stringify(context.signals));
console.log({ total });
