import { decode } from "./lib/ascii85.js";
import { bytesToString } from "./lib/utils.js";

/**
 * @param {number} byte
 */
const isParityValid = (byte) => {
  const onesCount = (byte >> 1)
    .toString(2)
    .split("")
    .reduce((count, cur) => count + (cur === "1"), 0);
  return onesCount % 2 === parseInt(byte & 0b1);
};

/**
 * @param {number[]} bytes
 * @returns {string}
 */
const removeParityAndCombine = (bytes) => {
  const omegaByte = bytes
    .map((byte) => byte >> 1)
    .map((byte) => byte.toString(2).padStart(7, "0"))
    .join("");

  return omegaByte
    .split(/(.{8})/)
    .filter((x) => x !== "")
    .map((x) => parseInt(x, 2));
};

export const solve = (input) => {
  const ascii85Decoded = decode(input);

  let windowOfValidBytes = [];
  let solution = [];

  for (const byte of ascii85Decoded) {
    if (isParityValid(byte)) {
      windowOfValidBytes.push(byte);
    }

    if (windowOfValidBytes.length === 8) {
      solution.push(...removeParityAndCombine(windowOfValidBytes));
      windowOfValidBytes = [];
    }
  }

  return bytesToString(solution);
};
