export const array1d = <T>(len: number, valFactory: (i) => T) => new Array(len).fill(0).map((val, i) => valFactory(i));
export const array2d = <T>(h: number, w: number, valFactory: (i) => T): T[][] => array1d(h, () => null).map(() => array1d(w, valFactory));

export type Direction = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";

export class Item<T> {
  constructor(public val: T, public x: number, public y: number) {}

  static DIRECTIONS = {
    ALL: ["nw", "n", "ne", "w", "e", "sw", "s", "se"] as Direction[],
    DIAGONAL: ["nw", "ne", "sw", "se"] as Direction[],
    STRAIGHT: ["n", "e", "w", "s"] as Direction[],
  };

  nw: Item<T>;
  n: Item<T>;
  ne: Item<T>;
  w: Item<T>;
  e: Item<T>;
  sw: Item<T>;
  s: Item<T>;
  se: Item<T>;

  neighbors(directions = Item.DIRECTIONS.ALL) {
    return directions.map((d) => this[d]).filter((x) => !!x);
  }

  toString() {
    const val = this?.val ?? " ";
    const isObject = typeof val !== "number" && typeof val !== "string";
    return `x: ${this.x} y: ${this.y} val: ${isObject ? JSON.stringify(val) : val}`;
  }
}

export class Grid<T> {
  public items: Item<T>[][];

  constructor(values: T[][]) {
    const items = values.map((row, y) => {
      return row.map((value, x) => {
        return new Item(value, x, y);
      });
    });

    const flat = items.flat();
    flat.forEach((item) => {
      const { x, y } = item;

      const yN = y - 1;
      const yS = y + 1;
      const xW = x - 1;
      const xE = x + 1;

      item.nw = items?.[yN]?.[xW];
      item.n = items?.[yN]?.[x];
      item.ne = items?.[yN]?.[xE];
      item.w = items?.[y]?.[xW];
      item.e = items?.[y]?.[xE];
      item.sw = items?.[yS]?.[xW];
      item.s = items?.[yS]?.[x];
      item.se = items?.[yS]?.[xE];
    });

    this.items = items;
  }

  get height() {
    return this.items.length;
  }

  get width() {
    return this.items[0].length;
  }

  col = (x: number) => this.items.map((line) => line[x]);
  row = (y: number) => this.items[y];

  rect(x1: number, y1: number, x2: number, y2: number): Item<T>[][] {
    return this.items.slice(Math.min(y1, y2), Math.max(y1, y2)).map((line) => {
      return line.slice(Math.min(x1, x2), Math.max(x1, x2));
    });
  }

  toString(itemToString?: (item: Item<T>) => string) {
    itemToString = itemToString ?? ((item) => item.toString());
    return this.items
      .map((line) => {
        return line.map(itemToString).join("");
      })
      .join("\n");
  }
}
