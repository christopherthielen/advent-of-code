import { Counter, readLines, uniqR } from "../util";

type Direction = "<" | "v" | ">" | "^";
const input = readLines("input.txt")[0].split("") as Direction[];
const add = (a: number[], b: number[]) => a.map((a1, idx) => a1 + b[idx]);

class HouseCounter extends Counter {
  private coords = [0, 0];

  constructor() {
    super();
    this.count("0x0");
  }

  move(direction: Direction) {
    const delta = { "<": [0, -1], v: [-1, 0], ">": [0, 1], "^": [1, 0] };
    const c = (this.coords = add(this.coords, delta[direction]));
    this.count(`${c[0]}x${c[1]}`);
  }
}

const santa = new HouseCounter();
const robo = new HouseCounter();
input.forEach((direction, idx) => (idx % 2 === 0 ? santa : robo).move(direction));
const keys = [...santa.keys(), ...robo.keys()].reduce(uniqR, []);
console.log({ keys: keys.length, santa: santa.size, robo: robo.size });
console.log(keys.length);
