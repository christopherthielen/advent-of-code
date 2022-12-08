export const array1d = <T>(len: number, val: T) => new Array(len).fill(val);
export const array2d = <T>(h: number, w: number, val: T): T[][] => array1d(h, null).map(() => array1d(w, val));

export class Item<T> {
  constructor(public val: T, public x: number, public y: number) {}

  nw: Item<T>;
  n: Item<T>;
  ne: Item<T>;
  w: Item<T>;
  e: Item<T>;
  sw: Item<T>;
  s: Item<T>;
  se: Item<T>;
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

  rect(x1: number, y1: number, x2: number, y2: number): Item<T>[] {
    return this.items.slice(Math.min(y1, y2), Math.max(y1, y2)).flatMap((line) => {
      return line.slice(Math.min(x1, x2), Math.max(x1, x2));
    });
  }

  toString() {
    console.log("tostring");
    return this.items.map((line) => line.map((i) => i.val).join("")).join("\n");
  }
}
