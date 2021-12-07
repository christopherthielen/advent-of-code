import * as fs from "fs";
import * as path from "path";
import { range } from "lodash";

const inputPath = path.resolve(__dirname, "input.txt");
const input = fs.readFileSync(inputPath, "utf-8");
const [drawsLine, ...boardsLines] = input.split(/[\n\r]/g);
const draws = drawsLine.split(/,/).map((num) => parseInt(num, 10));

const MARK = -1;

class Board {
  constructor(private numbers: number[][]) {}

  rows = () => this.numbers;
  columns = () => range(0, 4).map((column) => this.rows().map((row) => row[column]));

  mark(draw: number) {
    this.numbers.forEach((row) => {
      row.forEach((num, idx) => {
        if (num === draw) {
          row[idx] = MARK;
        }
      });
    });
  }

  isWin() {
    const hasWinningRow = this.rows().some((row) => row.every((num) => num === MARK));
    const hasWinningCol = this.columns().some((col) => col.every((num) => num === MARK));
    return hasWinningRow || hasWinningCol;
  }
}

const boardData = [];
boardsLines.forEach((line) => {
  if (line.match(/^$/)) {
    boardData.push([]);
  } else {
    let numbers = line
      .split(/ +/)
      .filter((x) => !!x)
      .map((num) => parseInt(num, 10));
    boardData[boardData.length - 1].push(numbers);
  }
});

let boards = boardData.filter((data) => data.length === 5).map((data) => new Board(data));

for (const draw of draws) {
  boards.forEach((board) => board.mark(draw));
  const winners = boards.filter((board) => board.isWin());
  if (winners.length) {
    boards = boards.filter((board) => !winners.includes(board));
    if (boards.length === 0) {
      const undrawnNumbers = winners[0]
        .rows()
        .flat()
        .filter((num) => num !== MARK);
      const undrawnSum = undrawnNumbers.reduce((acc, num) => acc + num);
      console.log(undrawnSum * draw);
      process.exit(0);
    }
  }
}
