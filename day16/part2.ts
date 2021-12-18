import * as fs from "fs";
import * as path from "path";
import * as chalk from "chalk";
import assert = require("node:assert");

const inputPath = path.resolve(__dirname, "input.txt");

const lines = fs
  .readFileSync(inputPath, "utf-8")
  .split(/[\r\n]/)
  .map((line) => line.replace(/ .*/, ""))
  .filter((x) => !!x);

type Bit = 0 | 1;
type HexIntVal = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

const bits2int = (bits: Bit[]): number => {
  const intval = parseInt(bits.join(""), 2);
  if (isNaN(intval)) {
    debugger;
  }
  return intval;
};
const int2bits = (num: HexIntVal): Bit[] =>
  ("0000" + num.toString(2))
    .slice(-4)
    .split("")
    .map((x) => parseInt(x, 10) as Bit);

const hexString2Bits = (line: string) => {
  const chars = line.split("");
  return chars.map((c) => int2bits(parseInt(c, 16) as HexIntVal)).flat();
};

class Program {
  constructor(private program: Bit[]) {}

  pc: number = 0;

  public take = (count: number): Bit[] => {
    if (this.pc + count > this.program.length) {
      debugger;
    }
    if (!(count > 0)) {
      debugger;
    }
    const bits = this.program.slice(this.pc, this.pc + count);
    this.pc += count;
    return bits;
  };

  public readPacket() {
    const version = bits2int(this.take(3));
    const type = bits2int(this.take(3));
    if (type === 4) {
      return new Literal(this, version);
    } else {
      return new OperatorPacket(this, version, type);
    }
  }

  public dump() {
    const visitor = (packet: Packet, nest: number) => {
      console.log(`${new Array(nest * 4).fill(" ").join("")} type: ${packet.type} -- ${packet.toString()}`);
    };
    new Program(this.program).readPacket().walk(visitor);
  }

  public done() {
    const unprocessed = this.program.slice(this.pc);
    return unprocessed.length > 16 ? false : unprocessed.every((x) => x === 0);
  }
}

abstract class Packet {
  public packetStart;

  constructor(public p: Program, public version: number, public type: number) {
    this.packetStart = p.pc - 6;
  }

  public walk(visitor: (packet: Packet, nest: number) => void, nest: number = 0) {
    visitor(this, nest);
    this.subPackets().forEach((sp) => sp.walk(visitor, nest + 1));
  }

  abstract toString(): string;

  abstract subPackets(): Packet[];

  abstract result(): number;
}

class Literal extends Packet {
  static type = 4;
  public val: number;

  constructor(p: Program, version: number) {
    super(p, version, Literal.type);
    this.val = this.read();
  }

  private read(): number {
    return bits2int(this.readBlock());
  }

  private readBlock(): Bit[] {
    const [type, ...bits] = this.p.take(5);
    if (type === 1) {
      return bits.concat(this.readBlock());
    } else {
      return bits;
    }
  }

  subPackets(): Packet[] {
    return [];
  }

  result(): number {
    return this.val;
  }

  toString(): string {
    return `Literal: ${this.val}`;
  }
}

enum Op {
  SUM = 0,
  PRODUCT = 1,
  MIN = 2,
  MAX = 3,
  GT = 5,
  LT = 6,
  EQ = 7,
}

class OperatorPacket extends Packet {
  public mode: 0 | 1;
  public mode0Length: number;
  public mode1SubPacketCount: number;
  public _subPackets: Packet[];

  constructor(p: Program, version: number, type: number) {
    super(p, version, type);
    this.mode = this.p.take(1)[0];
    this.readSubPacketsMeta();
    this.readSubPackets();
  }

  readSubPacketsMeta() {
    if (this.mode === 0) {
      this.mode0Length = bits2int(this.p.take(15));
    } else {
      this.mode1SubPacketCount = bits2int(this.p.take(11));
    }
  }

  readSubPackets() {
    this._subPackets = [];
    if (this.mode === 0) {
      const subProgram = new Program(this.p.take(this.mode0Length));
      while (!subProgram.done()) {
        this._subPackets.push(subProgram.readPacket());
      }
    } else {
      for (let i = 0; i < this.mode1SubPacketCount; i++) {
        this._subPackets.push(this.p.readPacket());
      }
    }
  }

  subPackets(): Packet[] {
    return this._subPackets;
  }

  result() {
    switch (this.type as Op) {
      case Op.SUM:
        return this.subPackets().reduce((acc, s) => acc + s.result(), 0);
      case Op.PRODUCT:
        return this.subPackets()
          .map((x) => x.result())
          .reduce((acc, s) => acc * s);
      case Op.MIN:
        return Math.min(...this.subPackets().map((s) => s.result()));
      case Op.MAX:
        return Math.max(...this.subPackets().map((s) => s.result()));
      case Op.GT:
        const [gtleft, gtright] = this.subPackets().map((s) => s.result());
        return gtleft > gtright ? 1 : 0;
      case Op.LT:
        const [ltleft, ltright] = this.subPackets().map((s) => s.result());
        return ltleft < ltright ? 1 : 0;
      case Op.EQ:
        const [eqleft, eqright] = this.subPackets().map((s) => s.result());
        return eqleft === eqright ? 1 : 0;
    }
  }

  toString(): string {
    return `Op[${Op[this.type]}]`;
  }
}

lines.forEach((line) => {
  console.log(line);
  const program = new Program(hexString2Bits(line));
  program.dump();
  console.log(`result: ${program.readPacket().result()}\n`);
});
