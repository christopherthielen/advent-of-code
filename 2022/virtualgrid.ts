import { Direction, IItem } from "./grid";
import { range } from "./util";

const minVal = (numbers: number[]) => numbers.reduce((acc, x) => Math.min(acc, x));
const maxVal = (numbers: number[]) => numbers.reduce((acc, x) => Math.max(acc, x));

// Finds the index matching the number
// [0, 1, 2, 3, 4, 5, 6, 7, 8]
/** @param cmp comparison function:
 * - if 'other' is the desired value return 0
 * - if the desired value is greater than 'other' return < 0
 * - if the desired value is less than 'other' return > 0
 * @return the index of the matching item, or the index where the matching item would be.
 *    Always check if the item is actually found at the returned index.
 * */
const binarySearch = <T>(items: T[], cmp: (other: T) => number): number => {
  let low = 0;
  let high = items.length;
  while (high !== low) {
    let idx = low + Math.floor((high - low) / 2);
    const comparison = cmp(items[idx]);
    if (comparison === 0) {
      return idx;
    } else if (comparison > 0) {
      if (low === idx) return low;
      low = idx;
    } else if (comparison < 0) {
      if (high === idx) return high;
      high = idx;
    }
  }
  return high;
};

const xySort = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = a.x - b.x;
  return dx !== 0 ? dx : a.y - b.y;
};

// Backed by a real Grid, automatically expands if a coordinate outside the current bounds is requested
export class VirtualGrid<T = any> {
  constructor(public factory: () => T) {}

  private BUCKETS = 1024 * 512;
  public items: VItem<T>[][] = new Array(this.BUCKETS).fill(0).map(() => []);
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;

  private bucket = (x: number, y: number) => this.items[Math.abs(x + y) % this.BUCKETS];

  public clone(): VirtualGrid<T> {
    const clone = new VirtualGrid(this.factory);
    clone.items = this.items.map((bucket) => bucket.map((item) => new VItem(clone, item.x, item.y, item.val)));
    clone.minX = this.minX;
    clone.minY = this.minY;
    clone.maxX = this.maxX;
    clone.maxY = this.maxY;
    return clone;
  }

  set(x: number, y: number, val: T): void {
    const item = this.getItem(x, y) ?? this.addItem(x, y);
    item.val = val;
  }

  has(x: number, y: number): boolean {
    return Boolean(this.getItem(x, y));
  }

  getItem(x: number, y: number): VItem<T> {
    const cmp = (item: VItem<T>) => xySort(item, { x, y });
    const bucket = this.bucket(x, y);
    const idx = binarySearch(bucket, cmp);
    const maybeItem = bucket[idx];
    return maybeItem && cmp(maybeItem) === 0 ? maybeItem : undefined;
  }

  addItem(x: number, y: number): VItem<T> {
    const newItem = new VItem<T>(this, x, y, this.factory());
    const bucket = this.bucket(x, y);
    const cmp = (item: VItem<T>) => xySort(item, { x, y });
    const idx = binarySearch(bucket, cmp);
    bucket.splice(idx, 0, newItem);
    this.updateMinMax(newItem);
    return newItem;
  }

  get(x: number, y: number): T {
    const item = this.getItem(x, y);
    return item ? item.val : this.factory();
  }

  row(y: number, minx?: number, maxx?: number) {
    const items = this.items.flat().filter((r) => r.y === y);
    const get = (x: number) => items.find((i) => i.x === x);
    const min = minx ?? minVal(items.map((i) => i.x));
    const max = maxx ?? maxVal(items.map((i) => i.x));
    return range(min, max).map((x) => get(x) ?? new VItem<T>(this, x, y, this.factory()));
  }

  col(x: number, miny?: number, maxy?: number) {
    const items = this.items.flat().filter((r) => r.x === x);
    const get = (y: number) => items.find((i) => i.y === y);
    const min = miny ?? minVal(items.map((i) => i.y));
    const max = maxy ?? maxVal(items.map((i) => i.y));
    return range(min, max).map((y) => get(y) ?? new VItem<T>(this, x, y, this.factory()));
  }

  private updateMinMax(newItem: VItem<T>) {
    if (this.items.length === 1) {
      this.minX = newItem.x;
      this.maxX = newItem.x;
      this.minY = newItem.y;
      this.maxY = newItem.y;
    } else {
      this.minX = Math.min(this.minX, newItem.x);
      this.maxX = Math.max(this.maxX, newItem.x);
      this.minY = Math.min(this.minY, newItem.y);
      this.maxY = Math.max(this.maxY, newItem.y);
    }
  }

  toString(itemToString: (item: VItem<T>) => string = (i) => i.val as any) {
    return range(this.minY, this.maxY)
      .map((y) => {
        return this.row(y, this.minX, this.maxX)
          .map((item) => itemToString(item))
          .join("");
      })
      .join("\n");
  }
}

class VItem<T> implements IItem<T> {
  constructor(private grid: VirtualGrid, public x, public y, public val: T) {}

  private neighbor(dx: -1 | 0 | 1, dy: -1 | 0 | 1): IItem<T> {
    return this.grid.getItem(this.x + dx, this.y + dy) ?? new VItem(this.grid, this.x + dx, this.y + dy, this.grid.factory());
  }

  get nw(): IItem<T> {
    return this.neighbor(-1, -1);
  }

  get n(): IItem<T> {
    return this.neighbor(0, -1);
  }

  get ne(): IItem<T> {
    return this.neighbor(1, -1);
  }

  get w(): IItem<T> {
    return this.neighbor(-1, 0);
  }

  get e(): IItem<T> {
    return this.neighbor(1, 0);
  }

  get sw(): IItem<T> {
    return this.neighbor(-1, 1);
  }

  get s(): IItem<T> {
    return this.neighbor(0, 1);
  }

  get se(): IItem<T> {
    return this.neighbor(1, 1);
  }

  neighbors(directions?: Direction[]): IItem<T>[] {
    return directions.map((d) => this[d]);
  }
}
