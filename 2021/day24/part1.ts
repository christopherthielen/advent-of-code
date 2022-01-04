import * as fs from "fs";
import { memoize, range } from "lodash";
import * as path from "path";

// const inputPath = path.resolve(__dirname, "example1.txt");
// const inputPath = path.resolve(__dirname, "example2.txt");
// const inputPath = path.resolve(__dirname, "example3.txt");
const inputPath = path.resolve(__dirname, "input.txt");
// const inputPath = path.resolve(__dirname, "14.txt");
let DEBUG = false;

let registers = { w: 0, x: 0, y: 0, z: 0 };

let input = "13579246899999".split("").map((x) => parseInt(x, 10));

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
type Command2 = { op: () => void; v1: Var; v2: Var; l: number };
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
    const command2 = { ...cmd, l, op: () => op(command2) };
    programs[programs.length - 1].push(command2);
  });

const product = <T, T2>(array1: T[], array2: T2[]) => array1.map((val1) => array2.map((val2) => [val1, val2])).flat(1) as [T, T2][];
const registersInitial = { w: 0, x: 0, y: 0, z: 0 };

// let runs = 0;
// let ticks = Date.now();
// function run(program: Command2[], w: number = 0, z: number = 0) {
//   // const op = getOp();
//   const code = program.slice();
//   registers = { ...registersInitial, w, z };
//   while (code.length) code.shift().op();
//   runs++;
//   if (runs % 10000000 === 0) {
//     const now = Date.now();
//     const delta = now - ticks;
//     // console.log(`runs per ms: ${runs / (now - ticks)} ${delta}`);
//     // console.log(`ops per ms: ${(runs * program.length) / (now - ticks)} ${delta}`);
//     runs = 0;
//     ticks = now;
//   }
//   return registers.z;
// }

// type Match = { w: number; z: number; output: number };
// function _findMatches(program: Command2[], desiredOutput: number): Match[] {
//   return product(range(9, 0), range(0, 1000000))
//     .map(([w, z]) => ({ w, z, output: run(program, w, z) }))
//     .filter((result) => result.output === desiredOutput);
// }

// const findMatches = memoize(_findMatches, (program, desiredOutput) => programs.indexOf(program) + "-" + desiredOutput);

// const winners: number[] = [];
// function runPrograms(programsReversed: Command2[][], previous?: Match[]) {
//   const [program, ...remaining] = programsReversed;
//   const matches = findMatches(program, previous ? previous[0].z : 0);
//
//   matches.forEach((m) => {
//     if (!remaining.length) {
//       const winner = parseInt([m, ...previous].map((x) => x.w).join(""), 10);
//       winners.push(winner);
//       console.log(`got one: ${winner} (${winners.length} total)`);
//     } else {
//       runPrograms(remaining, previous ? [m, ...previous] : [m]);
//     }
//   });
// }

// runPrograms(programs.reverse());
// winners.sort();
// console.log(`Got ${winners.length} winners, min/max: ${winners[0]}, ${winners[winners.length - 1]}`);

const run = memoize(_run, (ci, w, z) => [ci, w, z].join("-"));

function _run(codeIndex: number, w: number, z: number): number {
  const commands = programs[codeIndex];
  registers.w = w;
  registers.z = z;
  for (let i = 0; i < commands.length; i++) {
    commands[i].op();
  }
  return registers.z;
}

let start = Date.now();
let ticks = start;
// const MAX = 99455293716156;
// const MIN = 99450000000000;
const MAX = 99999999999999;
const MIN = 99455293716156;
for (let x = MAX; x >= MIN; x--) {
  input = ("" + x).split("").map((x) => parseInt(x, 10));
  if (!input.some((x) => x === 0)) {
    registers = { w: 0, x: 0, y: 0, z: 0 };
    for (let i = 0; i < programs.length; i++) {
      registers.z = run(i, input[i], registers.z);
    }
    const result = registers.z === 0;
    if (Date.now() - ticks >= 10000) {
      const complete = (MAX - x) / (MAX - MIN);
      console.log(
        `${x}: ${result} ${Math.floor(((MAX - x) / (Date.now() - start)) * 1000)}/sec ${(complete * 100).toFixed(8)}% ETA: ${(
          (Date.now() - start) /
          complete /
          60000
        ).toFixed(2)} minutes`
      );
      // console.log(`${x}: ${result} ${Math.floor(((MAX - x) / (Date.now() - start)) * 1000)}/sec ${(complete * 100).toFixed(8)}%`);
      ticks = Date.now();
    } else if (result) {
      // found 99999795919456 after 5 mins
      console.log(`${x}: ${result}`);
      process.exit(1);
    }
  }
}
