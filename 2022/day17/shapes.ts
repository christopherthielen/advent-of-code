import { VirtualGrid } from "../virtualgrid";

export type Coord = { x: number; y: number };

export class Shape {
  private sprite: string[][];
  private spriteCoords: Coord[];
  public coord: Coord = { x: 0, y: 0 };
  public width: number;
  public height: number;

  constructor(private grid: VirtualGrid, src: string) {
    const lines = src.split("\n");
    this.sprite = lines.map((line) => line.split("")).filter((chars) => chars.length);
    this.spriteCoords = this.sprite
      .flatMap((line, y) => line.map((char, x) => (char === "#" ? { x, y } : null)))
      .filter((coord) => Boolean(coord));
    this.width = this.sprite.reduce((acc, line) => Math.max(acc, line.length), 0);
    this.height = this.sprite.length;
  }

  get coords() {
    const { x, y } = this.coord;
    return this.spriteCoords.map((c) => ({ x: x + c.x, y: y + c.y }));
  }

  move(dx: number, dy: number): boolean {
    const blocked = this.coords.some((coord) => this.grid.get(coord.x + dx, coord.y + dy) !== ".");
    if (blocked) return false;
    this.coord.x += dx;
    this.coord.y += dy;
    return true;
  }

  handleJet = (jet: "<" | ">") => (jet === "<" ? this.left() : this.right());
  left = (): boolean => this.coord.x > 0 && this.move(-1, 0);
  right = (): boolean => this.coord.x < 7 - this.width && this.move(1, 0);
  down = (): boolean => this.move(0, 1);

  spawn() {
    this.coord.x = 2;
    this.coord.y = this.grid.minY - 3 - this.height;
  }

  land() {
    this.coords.forEach(({ x, y }) => this.grid.set(x, y, "#"));
  }
}

const DASH = (grid: VirtualGrid) =>
  new Shape(
    grid,
    `
####
`
  );
const PLUS = (grid: VirtualGrid) =>
  new Shape(
    grid,
    `
.#.
###
.#.
`
  );
const ELL = (grid: VirtualGrid) =>
  new Shape(
    grid,
    `
..#
..#
###
`
  );
const PIPE = (grid: VirtualGrid) =>
  new Shape(
    grid,
    `
#
#
#
#
`
  );
const SQUARE = (grid: VirtualGrid) =>
  new Shape(
    grid,
    `
##
##
`
  );
export const shapes = [DASH, PLUS, ELL, PIPE, SQUARE];
