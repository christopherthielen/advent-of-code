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

const gates: Gate[] = readLines("input.txt").map((line, idx) => {
  const [instruction, wire] = line.split(" -> ");
  if (instruction.includes(" AND ")) {
    const [a, b] = instruction.split(" AND ");
    return And(a, b, wire);
  } else if (instruction.includes(" OR ")) {
    const [a, b] = instruction.split(" OR ");
    return Or(a, b, wire);
  } else if (instruction.includes(" LSHIFT ")) {
    const [a, b] = instruction.split(" LSHIFT ");
    return LShift(a, toInt(b), wire);
  } else if (instruction.includes(" RSHIFT ")) {
    const [a, b] = instruction.split(" RSHIFT ");
    return RShift(a, toInt(b), wire);
  } else if (instruction.includes("NOT ")) {
    const [_, a] = instruction.split("NOT ");
    return Not(a, wire);
  } else if (instruction.match(/^\d+$/)) {
    return Constant(toInt(instruction), wire);
  } else if (instruction.match(/^[a-z]+$/)) {
    return Wire(instruction, wire);
  } else {
    throw new Error(line);
  }
});

w("b").get = () => 46065;
console.log("---------------------------");
console.log(w("a").get());
