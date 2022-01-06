import { readLines, rpad, toInt } from "../util";

// const program = readLines("example1.txt")
const program = readLines("input.txt")
  .map((line) => /([a-z]{3}) (a|b)?(?:, )?([+-]\d+)?/.exec(line))
  .map((match) => {
    const [_, instr, r1, arg] = match;
    return { instr, r1, arg: toInt(arg) };
  });

const R = { a: 1, b: 0 };
const ops = {
  hlf: (r1) => ((R[r1] = Math.floor(R[r1] / 2)), 1),
  tpl: (r1) => ((R[r1] = R[r1] * 3), 1),
  inc: (r1) => ((R[r1] = R[r1] + 1), 1),
  jmp: (_r1, offset) => offset,
  jie: (r1, offset) => (R[r1] % 2 === 0 ? offset : 1),
  jio: (r1, offset) => (R[r1] === 1 ? offset : 1),
};

function step() {
  const { instr, r1, arg } = program[PC];
  const instrStr = rpad(12, `${PC}: ${instr}${r1 ? " " + r1 : ""}${isNaN(arg) ? "" : " " + arg}`);
  let offset = ops[instr](r1, arg) ?? 1;
  PC = PC + offset;
  console.log(`${instrStr} [${R.a},${R.b}]${offset !== 1 ? ` -> ${PC}` : ""}`);
}

let PC = 0;
while (PC >= 0 && PC < program.length) {
  step();
}
