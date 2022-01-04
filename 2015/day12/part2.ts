import * as fs from "fs";

const books = JSON.parse(fs.readFileSync("input.txt", "utf-8"));

let total = 0;

function walk(visitor: (x: any) => void, x: any) {
  if (Array.isArray(x)) {
    x.forEach((val) => walk(visitor, val));
  } else if (typeof x === "object") {
    if (Object.values(x).every((val) => val !== "red")) {
      Object.values(x).forEach((val) => walk(visitor, val));
    }
  } else {
    visitor(x);
  }
}

walk((val) => (total += typeof val === "number" ? val : 0), books);

console.log(total);
