import * as fs from "fs";
import cluster from "cluster";
import { memoize, range } from "lodash";
import * as path from "path";
import { cpus } from "os";

// const inputPath = path.resolve(__dirname, "example1.txt");
// const inputPath = path.resolve(__dirname, "example2.txt");
// const inputPath = path.resolve(__dirname, "example3.txt");
const inputPath = path.resolve(__dirname, "input.txt");
// const inputPath = path.resolve(__dirname, "14.txt");
let DEBUG = false;

const W = 0, X = 1, Y = 2, Z = 3; // prettier-ignore
const addrs = { w: W, x: X, y: Y, z: Z };
let registers = [0, 0, 0, 0];

const ops = {
  // inp: (cmd: Command2) => (registers[cmd.v1] = input.shift()),
  inp: (cmd: Command2) => {}, // (registers[cmd.v1] = input.shift()),
  add: (cmd: Command2) => (registers[cmd.v1] = registers[cmd.v1] + registers[cmd.v2]),
  mul: (cmd: Command2) => (registers[cmd.v1] = registers[cmd.v1] * registers[cmd.v2]),
  div: (cmd: Command2) => (registers[cmd.v1] = Math.floor(registers[cmd.v1] / registers[cmd.v2])),
  mod: (cmd: Command2) => (registers[cmd.v1] = registers[cmd.v1] % registers[cmd.v2]),
  eql: (cmd: Command2) => (registers[cmd.v1] = registers[cmd.v1] === registers[cmd.v2] ? 1 : 0),
  addl: (cmd: Command2) => (registers[cmd.v1] = registers[cmd.v1] + cmd.l),
  mull: (cmd: Command2) => (registers[cmd.v1] = registers[cmd.v1] * cmd.l),
  divl: (cmd: Command2) => (registers[cmd.v1] = Math.floor(registers[cmd.v1] / cmd.l)),
  modl: (cmd: Command2) => (registers[cmd.v1] = registers[cmd.v1] % cmd.l),
  eqll: (cmd: Command2) => (registers[cmd.v1] = registers[cmd.v1] === cmd.l ? 1 : 0),
};

type Instruction = "inp" | "add" | "mul" | "div" | "mod" | "eql";
type Var = "w" | "x" | "y" | "z";
type Command = { instruction: Instruction; v1: Var; v2: Var };
type Command2 = { op: () => void; v1: number; v2: number; l: number };
const programs: Command2[][] = [];
fs.readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x)
  .map((line) => /(inp|add|mul|div|mod|eql) ([wxyz]) ?([-wxyz0-9]*)?/.exec(line))
  .map(([_match, instruction, var1, var2]) => ({ instruction, v1: var1, v2: var2 } as Command))
  .forEach((cmd) => {
    if (cmd.instruction === "inp") {
      programs.push([]);
    }
    const l = parseInt(cmd.v2);
    const op = isNaN(l) ? ops[cmd.instruction] : ops[cmd.instruction + "l"];
    const command2 = { ...cmd, v1: addrs[cmd.v1], v2: addrs[cmd.v2], l, op: () => op(command2) };
    programs[programs.length - 1].push(command2);
  });

const run = memoize(_run, (ci, w, z) => (z << 8) + (ci << 4) + w);

function _run(codeIndex: number, w: number, z: number): number {
  const commands = programs[codeIndex];
  if (!commands) {
    debugger;
  }
  registers[W] = w;
  registers[Z] = z;
  for (let i = 0; i < commands.length; i++) {
    commands[i].op();
  }
  return registers[Z];
}

let start = Date.now();
// let ticks = start;
// const MIN = 11111111111111;
// const MIN = 99455293716156;
const MIN = 12125141488356;
const MAX = 99999999999999;
const CHUNK = 100000000;
// for (let x = MIN; x <= MAX; x++) {
//   input = ("" + x).split("").map((x) => parseInt(x, 10));
//   if (!input.some((x) => x === 0)) {
//     registers = [0, 0, 0, 0];
//     for (let i = 0; i < programs.length; i++) {
//       registers[Z] = run(i, input[i], registers[Z]);
//     }
//     const result = registers[Z] === 0;
//     if (Date.now() - ticks >= 10000) {
//       const complete = (x - MIN) / (MAX - MIN);
//       console.log(
//         `${x}: ${result} ${Math.floor(((x - MIN) / (Date.now() - start)) * 1000)}/sec ${(complete * 100).toFixed(8)}% ETA: ${(
//           (Date.now() - start) /
//           complete /
//           60000
//         ).toFixed(2)} minutes`
//       );
//       // console.log(`${x}: ${result} ${Math.floor(((MAX - x) / (Date.now() - start)) * 1000)}/sec ${(complete * 100).toFixed(8)}%`);
//       ticks = Date.now();
//     } else if (result) {
//       // found 99999795919456 after 5 mins
//       console.log(`${x}: ${result}`);
//       process.exit(1);
//     }
//   }
// }

function processDigit(prev: number[], prevZ: number, start = 1, end = 9) {
  const digit = prev.length;
  for (let i = start; i <= end; i++) {
    const newZ = run(digit, i, prevZ);
    if (digit !== 13) {
      processDigit(prev.concat(i), newZ);
    } else if (newZ === 0) {
      const message = `winner ${prev.join("") + i}`;
      console.log(message);
      cluster.worker.send(message);
      process.exit(0);
    }
  }
}

if (cluster.isPrimary) {
  let STARTVAL = MIN - (MIN % CHUNK);
  let current = STARTVAL;

  for (let i = 0; i < cpus().length - 1; i++) {
    cluster.fork();
  }

  cluster.on("message", (worker, msg) => {
    const [_match, event, detail] = /([^ ]+) ?(.*)?/.exec(msg);
    if (event === "winner") {
      Object.values(cluster.workers).forEach((w) => w.kill());
    } else if (event === "disconnect") {
      process.exit(0);
    } else if (event === "idle") {
      const complete = (current - STARTVAL) / (MAX - STARTVAL);
      console.log(`${worker.id} ${current}: ${Math.floor((current - STARTVAL) / (Date.now() - start))}/ms ${(complete * 100).toFixed(8)}%`);
      worker.send(`chunk ${current}`);
      current += CHUNK;
    }
  });
} else {
  process.on("message", (msg: string) => {
    const [_match, event, detail] = /([^ ]+) ?(.*)?/.exec(msg);
    if (event === "chunk") {
      const prev = detail.split("").map((c) => parseInt(c, 10));
      while (prev[prev.length - 1] === 0) prev.pop();
      cluster.worker.send(`working: ${detail}`);
      const prevZ = prev.reduce((prevZ, w, idx) => run(idx, w, prevZ), 0);
      processDigit(prev, prevZ);
      cluster.worker.send("idle");
    }
  });
  cluster.worker.send("idle");
}

process.on("beforeExit", () => "MEIN LABEN");
