import { readLines, toInt } from "../util";

const lines = readLines("input.txt");
// const lines = readLines("example.txt");

// prettier-ignore
type Reg = "a" | "b" | "c" | "d";
const registers = { a: 0, b: 0, c: 0, d: 0 };

function cpy(x: string, y: Reg) {
  const num = toInt(x);
  const val = isNaN(num) ? registers[x] : num;
  registers[y] = val;
}

function inc(x: Reg) {
  registers[x]++;
}

function dec(x: Reg) {
  registers[x]--;
}

function jnz(x: string, y: string) {
  const num = toInt(x);
  const val = isNaN(num) ? registers[x] : num;
  if (val !== 0) {
    pc += toInt(y) - 1;
  }
}

let pc = 0;
const OPS = { cpy, inc, dec, jnz };

while (pc < lines.length) {
  const [opcode, x, y] = lines[pc].split(" ");
  const op = OPS[opcode];
  op(x, y);
  pc++;
}

console.log(registers);
