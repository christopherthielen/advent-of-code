import { range } from "../util";

// const lines = readLines("example1.txt");
const firstCode = 20151125;
const row = 2981;
const col = 3075;

const nextcode = (code: number) => {
  return (code * 252533) % 33554393;
};

const fib = (end: number, start = 1) => range(start, end).reduce((a, x) => a + x, 0);

const codeNumber = (col: number, row: number) => {
  const fibEnd = row + col + -2;
  const foo = row === 1 ? 0 : fib(fibEnd, col);
  const codeId = foo + fib(col);
  console.log({ codeId });
  return range(1, codeId - 1).reduce((acc) => nextcode(acc), firstCode);
};

console.log(codeNumber(col, row));
