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
ops.forEach((op) => op.execute(context));
console.log(JSON.stringify(context.signals));

console.log("--------");

const crt = new Array(240);
for (let i = 0; i < 240; i++) {
  const x = i % 40;
  const spritex = context.signals[i];
  const spritehit = [spritex - 1, spritex, spritex + 1];
  const hit = spritehit.includes(x);
  crt[i] = hit ? "#" : ".";
}

const LINELEN = 40;
for (let i = 0; i < 240; i += LINELEN) {
  const line = crt.join("").substring(i, i + LINELEN);
  console.log(line);
}
