import * as fs from "fs";
import { cloneDeep, memoize, partition } from "lodash";
import * as path from "path";
import assert = require("node:assert");

// const inputPath = path.resolve(__dirname, "example1.txt");
const inputPath = path.resolve(__dirname, "input.txt");

const lines = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .filter((x) => !!x);

type ShrimpType = "a" | "b" | "c" | "d";
type Move = { type: "out" | "in"; from: Address; to: Address; distance: number };
type Room = "a" | "b" | "c" | "d" | "h";
type Index = number;
type Address = [Room, Index];
type ShrimpTuple = [Address, ShrimpType];
type Shrimp = ShrimpType;
const TYPES: ShrimpType[] = ["a", "b", "c", "d"];
const costs = { a: 1, b: 10, c: 100, d: 1000 };

interface BoardState {
  h: [Shrimp, Shrimp, Shrimp, Shrimp, Shrimp, Shrimp, Shrimp, Shrimp, Shrimp, Shrimp, Shrimp];
  a: [Shrimp, Shrimp];
  b: [Shrimp, Shrimp];
  c: [Shrimp, Shrimp];
  d: [Shrimp, Shrimp];
}

interface BoardMask {
  h: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  a: [boolean, boolean];
  b: [boolean, boolean];
  c: [boolean, boolean];
  d: [boolean, boolean];
}

const outTargets = [0, 1, 3, 5, 7, 9, 10];
const roomIdxs = { a: 2, b: 4, c: 6, d: 8 };
const outMoves = (room: Room, startIdx: number, mask: BoardMask): Move[] => {
  const moves: Move[] = [];
  const roomIdx = roomIdxs[room];
  const stuckIn1 = startIdx === 1 && mask[room][0];
  if (stuckIn1) return moves;
  const outCost = 1 + startIdx;
  const [left, right] = partition(outTargets, (x) => x < roomIdx);
  const move = (idx: number): Move => ({
    type: "out",
    distance: Math.abs(roomIdx - idx) + outCost,
    from: [room, startIdx],
    to: ["h", idx],
  });
  left.reverse().reduce((isClear, idx) => !!(isClear && !mask.h[idx] && moves.push(move(idx))), true);
  right.reduce((isClear, idx) => !!(isClear && !mask.h[idx] && moves.push(move(idx))), true);
  return moves;
};

const inMove = (room: Shrimp, hallIndex: number, mask: BoardMask): Move => {
  const roomState = mask[room];
  if (roomState[0]) return null;

  const roomIdx = roomIdxs[room];
  const hallpath = hallIndex < roomIdx ? mask.h.slice(hallIndex + 1, roomIdx) : mask.h.slice(roomIdx, hallIndex - 1);
  if (hallpath.every((val) => !val)) {
    const dest = roomState[1] ? 0 : 1;
    const inCost = dest + 1;
    return { type: "in", distance: Math.abs(roomIdx - hallIndex) + inCost, from: ["h", hallIndex], to: [room, dest] };
  }
};

class Board {
  constructor(public state: BoardState) {}

  done(shrimp: Shrimp): boolean {
    return this.state[shrimp].every((s) => s === shrimp);
  }

  enterable(room: ShrimpType) {
    const [zero, one] = this.state[room];
    return !one || (one === room && !zero);
  }

  boardMask() {
    const { a, b, c, d, h } = this.state;
    return {
      a: a.map((x) => !!x),
      b: b.map((x) => !!x),
      c: c.map((x) => !!x),
      d: d.map((x) => !!x),
      h: h.map((x) => !!x),
    } as BoardMask;
  }

  outMoves(): Move[] {
    const shrimps = TYPES.filter((room) => !this.done(room))
      .map((type): ShrimpTuple => {
        const room = this.state[type];
        return room[0] ? [[type, 0], room[0]] : room[1] && room[1] !== type ? [[type, 1], room[1]] : null;
      })
      .filter((x) => x);

    return shrimps.map((s) => outMoves(s[0][0], s[0][1], this.boardMask())).flat();
  }

  inMove(): Move {
    const enterable = {
      a: this.enterable("a"),
      b: this.enterable("b"),
      c: this.enterable("c"),
      d: this.enterable("d"),
    };
    return this.state.h
      .map((s, idx) => [["h", idx], s] as ShrimpTuple)
      .filter((x) => x[1])
      .map(([addr, type]) => {
        if (!enterable[type]) return null;
        return inMove(type, addr[1], this.boardMask());
      })
      .find((x) => x);
  }

  dump() {
    console.clear();
    console.log(this.toString());
  }

  toString(): string {
    const { a, b, c, d, h } = this.state;
    const s = (shrimp: Shrimp): string => (shrimp ? shrimp : ".");
    return [
      `#############`,
      `#${h.map(s).join("")}#`,
      `###${s(a[0])}#${s(b[0])}#${s(c[0])}#${s(d[0])}###`,
      `  #${s(a[1])}#${s(b[1])}#${s(c[1])}#${s(d[1])}#`,
      `  #########`,
    ].join("\n");
  }
}

const load = (room: ShrimpType): [Shrimp, Shrimp] => [
  lines[2].charAt(roomIdxs[room] + 1).toLowerCase() as ShrimpType,
  lines[3].charAt(roomIdxs[room] + 1).toLowerCase() as ShrimpType,
];

function move(move: Move, bs: BoardState) {
  const { from, to } = move;
  const [targetRoom, targetIdx] = to;
  const [srcRoom, srcAddr] = from;
  const shrimp: Shrimp = bs[srcRoom][srcAddr];

  bs[targetRoom][targetIdx] = shrimp;
  bs[srcRoom][srcAddr] = null;

  const cost = move.distance * costs[shrimp];
  // console.log(`${srcRoom}[${srcAddr}] -> ${targetRoom}[${targetIdx}] (${cost})`);
  return cost;
}

let ticks = Date.now();
const dump = (board: Board) => {
  if (Date.now() - ticks > 100) {
    board.dump();
    ticks = Date.now();
  }
};

const stats = { bad: 0, good: 0, slow: 0 };
const completionCosts = [];
let best = Number.MAX_SAFE_INTEGER;

function play(board: Board, cost = 0) {
  if (cost > best) {
    stats.slow++;
    return;
  }

  while (board.inMove()) {
    cost += move(board.inMove(), board.state);
    dump(board);
  }

  if (TYPES.every((t) => board.done(t))) {
    stats.good++;
    completionCosts.push(cost);
    best = Math.min(best, cost);
    assert(board.outMoves().length === 0);
    return;
  }

  const outmoves = board.outMoves();
  if (outmoves.length === 0) {
    stats.bad++;
  }
  for (let outmove of outmoves) {
    const board2: Board = new Board(cloneDeep(board.state));
    const cost2 = move(outmove, board2.state);
    dump(board2);
    play(board2, cost + cost2);
  }
}

const initialState: BoardState = {
  h: new Array(11).fill(null) as any,
  a: load("a"),
  b: load("b"),
  c: load("c"),
  d: load("d"),
};
const board = new Board(initialState);
play(board);
console.log(stats);
console.log(best);

// let total = 0;
// const mout = (room: Room, hallIdx: number) => {
//   const moveOut = board.outMoves().find((m) => m.from[0] === room && m.to[1] === hallIdx);
//   const cost = move(moveOut, board.state);
//   console.log(moveOut, cost);
//   board.dump();
//   return cost;
// };
//
// const min = (room: Room) => {
//   const moveIn = board.inMove();
//   const cost = move(moveIn, board.state);
//   console.log(moveIn, cost);
//   board.dump();
//   return cost;
// };
//
// total += mout("c", 3);
// total += mout("b", 5);
// total += min("c");
// total += mout("b", 5);
// total += min("b");
// total += mout("a", 3);
// total += min("b");
// total += mout("d", 7);
// total += mout("d", 9);
// total += min("d");
// total += min("d");
// total += min("a");
// console.log(total);
