import { readLines, toInt } from "../util";

type DestType = "bot" | "output";
type Dest = [DestType, number];
type Bot = { type: "bot"; bot: number; values: number[]; low: Dest; high: Dest };
type Value = { type: "value"; value: number; bot: number };

type Instruction = Bot | Value;

// const file = "example.txt";
const file = "input.txt";
const lines = readLines(file);

const instructions: Instruction[] = lines.map((line) => {
  const valueRegexp = /value (\d+) goes to bot (\d+)/;
  const botRegexp = /bot (\d+) gives low to (bot|output) (\d+) and high to (bot|output) (\d+)/;
  const valueMatch = valueRegexp.exec(line);
  const botMatch = botRegexp.exec(line);
  if (valueMatch) {
    const [_, value, bot] = valueMatch;
    return { type: "value", value: toInt(value), bot: toInt(bot) } as Value;
  } else if (botMatch) {
    const [_, bot, lowType, lowId, highType, highId] = botMatch;
    return {
      type: "bot",
      bot: toInt(bot),
      values: [],
      low: [lowType as DestType, toInt(lowId)],
      high: [highType as DestType, toInt(highId)],
    } as Bot;
  }
});

const bots = instructions.filter((x) => x.type === "bot").sort((a: Bot, b: Bot) => a.bot - b.bot) as Bot[];
const values = instructions.filter((x) => x.type === "value").sort((a: Value, b: Value) => a.bot - b.bot) as Value[];
const outputs = [];

const bot = (botid: number) => bots.find((b) => b.bot === botid);
const insert = (value: number, [type, id]: Dest) => {
  if (type === "bot") {
    bot(id).values.push(value);
  } else if (type === "output") {
    outputs.push([type, id, value]);
  }
};

values.forEach(({ value, bot }) => {
  insert(value, ["bot", bot]);
});

const run = () => {
  let next = bots.find((b) => b.values.length > 1);
  while (next) {
    const [a, b] = next.values.splice(0, 2);
    const { low, high } = next;
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    if (min === 17 && max === 61) {
      console.log("Bot number " + next.bot);
    }
    insert(min, low);
    insert(max, high);
    next = bots.find((b) => b.values.length > 1);
  }
};

run();

outputs.sort((a, b) => a[1] - b[1]).forEach((o) => console.log(o.join(" ")));

const product = outputs
  .filter((o) => [0, 1, 2].includes(o[1]))
  .map((o) => o[2])
  .reduce((acc, x) => acc * x, 1);
console.log({ product });
