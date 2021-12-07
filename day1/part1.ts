import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.resolve(__dirname, 'input.txt')
const input = fs.readFileSync(inputPath, 'utf-8');
const numbers = input.split(/[\r\n]/g).map(num => parseInt(num, 10));

let increments = 0;
for (let i = 1; i < numbers.length; i++) {
  if (numbers[i] > numbers[i - 1]) {
    increments++;
  }
}
console.log(increments);
