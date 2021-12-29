import * as fs from "fs";
import cluster from "cluster";
import { memoize, range } from "lodash";
import * as path from "path";
import { DateTime, Duration } from "luxon";

import { cpus } from "os";

const inputPath = path.resolve(__dirname, "input.txt");

const W = 0, X = 1, Y = 2, Z = 3; // prettier-ignore
let registers = [0, 0, 0, 0];

function decompiled(divz: 1 | 26, addx: number, addy: number) {
  let x = (registers[Z] % 26) + addx === registers[W] ? 0 : 1;
  return (registers[Z] = Math.floor(registers[Z] / divz) * (25 * x + 1) + (registers[W] + addy) * x);
}

function run(codeIndex: number, w: number, z: number): number {
  registers[W] = w;
  registers[Z] = z;
  // prettier-ignore
  switch (codeIndex) {
    case 0:
      return decompiled(1, 10, 1);
    case 1:
      return decompiled(1, 11, 9);
    case 2:
      return decompiled(1, 14, 12);
    case 3:
      return decompiled(1, 13, 6);
    case 4:
      return decompiled(26, -6, 9);
    case 5:
      return decompiled(26, -14, 15);
    case 6:
      return decompiled(1, 14, 7);
    case 7:
      return decompiled(1, 13, 12);
    case 8:
      return decompiled(26, -8, 15);
    case 9:
      return decompiled(26, -15, 3);
    case 10:
      return decompiled(1, 10, 6);
    case 11:
      return decompiled(26, -11, 2);
    case 12:
      return decompiled(26, -13, 10);
    case 13:
      return decompiled(26, -4, 12);
  }
  return registers[Z];
}

let start = Date.now();
// let ticks = start;
// const MIN = 11111111111111;
// const MIN = 99455293716156;
// const MIN = 99444444444444;
// const MAX = 99555555555555;
const MIN = 45300191516111;
const MAX = 55555555555555;
const CHUNK = 1000000000;

function processDigit(prev: number[], prevZ: number, start = 1, end = 9) {
  const digit = prev.length;
  for (let i = start; i <= end; i++) {
    const newZ = run(digit, i, prevZ);
    if (digit !== 13) {
      processDigit(prev.concat(i), newZ);
    } else if (newZ === 0) {
      const message = `winner ${prev.join("") + i}`;
      console.log(message);
      cluster.worker.send(message);
      process.exit(0);
    }
  }
}

// processDigit([9, 9, 4, 5, 5, 2, 9, 1, 5, 1, 6, 1, 5], 10, 6);

if (cluster.isPrimary) {
  let STARTVAL = MIN - (MIN % CHUNK);
  let current = STARTVAL;
  let pending: number[] = [];

  for (let i = 0; i < cpus().length; i++) {
    cluster.fork();
  }

  cluster.on("message", (worker, msg) => {
    const [_match, event, detail] = /([^ ]+) ?(.*)?/.exec(msg);
    if (event === "winner") {
      fs.writeFileSync("./winner.txt", msg + "\n");
      Object.values(cluster.workers).forEach((w) => w.kill());
    } else if (event === "disconnect") {
      process.exit(0);
    } else if (event === "idle") {
      const completedBlock = parseInt(detail, 10);
      if (!isNaN(completedBlock)) {
        pending = pending.filter((val) => val !== completedBlock * CHUNK);
        const minPending = Math.min(...pending);
        const complete = (minPending - STARTVAL) / (MAX - STARTVAL);
        const started = DateTime.fromMillis(start).toRelative();
        const estimate = (Date.now() - start) / complete;
        const eta = DateTime.fromMillis(start + estimate).toRelative();
        console.log(
          `${worker.id} ${completedBlock} ${minPending}: ${Math.floor((minPending - STARTVAL) / (Date.now() - start))}/ms ${(
            complete * 100
          ).toFixed(4)}% started: ${started} eta: ${eta}`
        );
      }
      let currentStr = "" + Math.floor(current / CHUNK);
      while (currentStr.indexOf("0") !== -1) {
        current += CHUNK;
        currentStr = "" + Math.floor(current / CHUNK);
      }
      pending.push(current);
      worker.send(`chunk ${Math.floor(current / CHUNK)}`);
      current += CHUNK;
    }
  });
} else {
  process.on("message", (msg: string) => {
    const [_match, event, detail] = /([^ ]+) ?(.*)?/.exec(msg);
    if (event === "chunk") {
      const prev = detail.split("").map((c) => parseInt(c, 10));
      cluster.worker.send(`working: ${detail}`);
      const prevZ = prev.reduce((prevZ, w, idx) => run(idx, w, prevZ), 0);
      processDigit(prev, prevZ);
      cluster.worker.send(`idle ${detail}`, (error) => {
        error && console.error(`failed to send message: idle ${detail}`);
      });
    }
  });
  cluster.worker.send("idle");
}

process.on("beforeExit", () => "MEIN LABEN");
