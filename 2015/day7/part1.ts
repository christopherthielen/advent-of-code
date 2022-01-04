import { memoize } from "lodash";
import { readLines, toInt } from "../util";

interface Gate {
  wire: string;

  get(): number;
}

const mask = (val: number) => val & 0xffff;
const w = (ref: string) => (ref.match(/^\d+$/) ? Constant(parseInt(ref, 10), "UNDEFINED") : gates.find((g) => g.wire === ref));
const Constant = (val: number, wire: string): Gate => ({ wire, get: () => val });
const And = (a: string, b: string, wire: string): Gate => ({ wire, get: memoize(() => mask(w(a).get() & w(b).get())) });
const Or = (a: string, b: string, wire: string): Gate => ({ wire, get: memoize(() => mask(w(a).get() | w(b).get())) });
const LShift = (a: string, shift: number, wire: string): Gate => ({
  wire,
  get: memoize(() => mask(w(a).get() << shift)),
});
const RShift = (a: string, shift: number, wire: string): Gate => ({
  wire,
  get: memoize(() => mask(w(a).get() >> shift)),
});
const Not = (a: string, wire: string): Gate => ({ wire, get: memoize(() => mask(~w(a).get())) });
const Wire = (a: string, wire: string): Gate => ({ wire, get: memoize(() => mask(w(a).get())) });

const Debug = (gate: Gate, line: string, idx: number): Gate => {
  return {
    wire: gate.wire,
    get: () => {
      const result = gate.get();
      console.log(idx, line, result);
      return result;
    },
  };
};

const gates: Gate[] = readLines("input.txt").map((line, idx) => {
  const [instruction, wire] = line.split(" -> ");
  if (instruction.includes(" AND ")) {
    const [a, b] = instruction.split(" AND ");
    return Debug(And(a, b, wire), line, idx);
  } else if (instruction.includes(" OR ")) {
    const [a, b] = instruction.split(" OR ");
    return Debug(Or(a, b, wire), line, idx);
  } else if (instruction.includes(" LSHIFT ")) {
    const [a, b] = instruction.split(" LSHIFT ");
    return Debug(LShift(a, toInt(b), wire), line, idx);
  } else if (instruction.includes(" RSHIFT ")) {
    const [a, b] = instruction.split(" RSHIFT ");
    return Debug(RShift(a, toInt(b), wire), line, idx);
  } else if (instruction.includes("NOT ")) {
    const [_, a] = instruction.split("NOT ");
    return Debug(Not(a, wire), line, idx);
  } else if (instruction.match(/^\d+$/)) {
    return Debug(Constant(toInt(instruction), wire), line, idx);
  } else if (instruction.match(/^[a-z]+$/)) {
    return Debug(Wire(instruction, wire), line, idx);
  } else {
    throw new Error(line);
  }
});

console.log("---------------------------");
console.log(w("a").get());
