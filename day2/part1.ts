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
const coordinates = { x: 0, y: 0 };
for (const command of commands) {
  switch (command.command) {
    case "up":
      coordinates.y -= command.count;
      break;
    case "down":
      coordinates.y += command.count;
      break;
    case "forward":
      coordinates.x += command.count;
      break;
  }
}
console.log(coordinates);
console.log(coordinates.x * coordinates.y);
