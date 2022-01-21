import { countBy } from "lodash";
import { readLines, toInt } from "../util";

const input = readLines("input.txt")
  .map((room) => /(.*)-(\d+)\[([a-z]+)]/.exec(room))
  .map(([_, room, sector, checksum]) => ({ room, sector, checksum }));

const realRooms = input.filter(({ room, sector, checksum }) => {
  const letters = room.split("").filter((c) => c !== "-");
  const counts = Object.entries(countBy(letters)) as Array<[string, number]>;
  const sorted = counts.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const computed = sorted
    .map(([letter]) => letter)
    .slice(0, 5)
    .join("");

  return computed === checksum;
});

console.log(realRooms.reduce((acc, room) => acc + toInt(room.sector), 0));
