import * as fs from "fs";
import * as path from "path";

interface Command {
  command: "forward" | "up" | "down";
  count: number;
}

const parseLine = (str: string): Command => {
  const [command, count] = str.split(/ /);
  return {
    command: command as Command["command"],
    count: parseInt(count, 10),
  };
};

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");
const commands = input.split(/[\r\n]/g).map(parseLine);
let position = 0;
let depth = 0;
let aim = 0;
for (const command of commands) {
  switch (command.command) {
    case "up":
      aim -= command.count;
      break;
    case "down":
      aim += command.count;
      break;
    case "forward":
      position += command.count;
      depth += aim * command.count;
      break;
  }
}
console.log({ position, depth });
console.log(position * depth);
