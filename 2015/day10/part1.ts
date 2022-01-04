import { permutations, readLines, toInt, uniqR } from "../util";

let input = "1113222113";

for (let i = 0; i < 40; i++) {
  // console.log(input);
  input = process(input).join("");
}
console.log(input.length);

function process(str: string) {
  const stack = [];
  str
    .split("")
    .map(toInt)
    .forEach((char, idx) => {
      if (char === stack[stack.length - 1]) {
        stack[stack.length - 2] = stack[stack.length - 2] + 1;
      } else {
        stack.push(1, char);
      }
    });
  return stack;
}
