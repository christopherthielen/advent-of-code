import * as fs from 'fs';
import * as path from 'path';

const inputPath = path.resolve(__dirname, 'input.txt')
const input = fs.readFileSync(inputPath, 'utf-8');
const numbers = input.split(/[\r\n]/g).map(num => parseInt(num, 10));

let increments = 0;
for (let i = 0; i < numbers.length - 3; i++) {
  const [a, b, c, d] = numbers.slice(i, i + 4)
  if ((b + c + d) > (a + b + c)) {
    increments++;
  }
}
console.log(increments);
