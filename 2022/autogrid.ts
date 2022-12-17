import { array2d, Grid, Item } from "./grid";

// Backed by a real Grid, automatically expands if a coordinate outside the current bounds is requested
export class AutoGrid<T = any> {
  constructor(private factory: () => T) {}

  private offsetx = 0;
  private offsety = 0;
  private grid = new Grid(array2d(2, 2, this.factory));

  get items() {
    return this.grid.items;
  }

  set(x: number, y: number, val: T) {
    this.checkRange(x, y);
    const xx = x + this.offsetx;
    const yy = y + this.offsety;
    return this.grid.set(xx, yy, val);
  }

  get(x: number, y: number): T {
    return this.getItem(x, y).val;
  }

  getItem(x: number, y: number): Item<T> {
    this.checkRange(x, y);
    const xx = x + this.offsetx;
    const yy = y + this.offsety;
    return this.grid.getItem(xx, yy);
  }

  row(y: number) {
    return this.grid.row(y + this.offsety);
  }

  col(x: number) {
    return this.grid.col(x + this.offsetx);
  }

  get minX() {
    return this.items[0][0].x;
  }

  get minY() {
    return this.items[0][0].y;
  }

  get maxX() {
    return this.items.slice(-1).pop().slice(-1).pop().x;
  }

  get maxY() {
    return this.items.slice(-1).pop().slice(-1).pop().y;
  }

  checkRange(x: number, y: number) {
    while (this.minX > x + this.offsetx) {
      this.expandW();
    }
    while (this.maxX < x + this.offsetx) {
      this.expandE();
    }
    while (this.minY > y + this.offsety) {
      this.expandN();
    }
    while (this.maxY < y + this.offsety) {
      this.expandS();
    }
  }

  public expandW = () => this.expandX("W");
  public expandE = () => this.expandX("E");

  private expandX(direction: "W" | "E") {
    if (direction === "W") {
      this.offsetx += this.grid.width;
    }

    const newItems = this.grid.items.map((origRow, yidx) => {
      const xoffset = direction === "W" ? 0 - this.offsetx : origRow[origRow.length - 1].x + 1;
      const newRow = new Array(this.grid.width).fill(0);
      const newItems = newRow.map((_, xidx) => new Item(this.factory(), xidx + xoffset, yidx - this.offsety));
      return direction === "W" ? newItems.concat(origRow) : origRow.concat(newItems);
    });
    this.grid.items = this.grid.relinkNeighbors(newItems);
  }

  public expandN = () => this.expandY("N");
  public expandS = () => this.expandY("S");

  public expandY(direction: "N" | "S") {
    if (direction === "N") {
      this.offsety += this.grid.height;
    }

    const yoffset = direction === "N" ? 0 - this.offsety : this.grid.items[this.grid.items.length - 1][0].y + 1;
    const newItems = new Array(this.grid.height).fill(0).map((__, yidx) => {
      return new Array(this.grid.width).fill(0).map((_, xidx) => new Item(this.factory(), xidx - this.offsetx, yidx + yoffset));
    });
    const items = direction === "N" ? newItems.concat(this.items) : this.items.concat(newItems);
    this.grid.items = this.grid.relinkNeighbors(items);
  }

  toString(itemToString?: (item: Item<T>) => string) {
    return this.grid.toString(itemToString);
  }
}
