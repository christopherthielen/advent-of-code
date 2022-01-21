import { countBy } from "lodash";
import { readLines, toInt } from "../util";

const input = readLines("input.txt")
  .map((room) => /(.*)-(\d+)\[([a-z]+)]/.exec(room))
  .map(([_, room, sector, checksum]) => ({ room, sector, checksum }));

const realRooms = input.filter(({ room, checksum }) => {
  const letters = room.split("").filter((c) => c !== "-");
  const counts = Object.entries(countBy(letters)) as Array<[string, number]>;
  const sorted = counts.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const computed = sorted
    .map(([letter]) => letter)
    .slice(0, 5)
    .join("");

  return computed === checksum;
});

const alpha = "abcdefghijklmnopqrstuvwxyz".split("");

const rooms = realRooms.map(({ room, sector, checksum }) => {
  const decrypted = room
    .split("")
    .map((c) => {
      const num = alpha.indexOf(c);
      return num >= 0 ? alpha[(num + toInt(sector)) % 26] : " ";
    })
    .join("");
  return { room, decrypted, sector, checksum };
});

console.log(
  rooms
    .map((room) => room.sector + " " + room.decrypted)
    .filter((str) => str.includes("northpole"))
    .join("\n")
);
