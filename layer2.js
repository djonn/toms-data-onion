import { decode } from "./lib/ascii85.js";

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
  const omegabyte = bytes
    .map((byte) => byte >> 1)
    .map((byte) => byte.toString(2).padStart(7, "0"))
    .join("");

  const characters = omegabyte
    .split(/(.{8})/)
    .filter((x) => x !== "")
    .map((x) => String.fromCharCode(parseInt(x, 2)));

  return characters.join("");
};

export const solve = (input) => {
  const ascii85Decoded = decode(input);
  const bytes = ascii85Decoded.split("").map((x) => x.charCodeAt(0));

  let windowOfValidBytes = [];
  let result = "";

  for (const byte of bytes) {
    if (isParityValid(byte)) {
      windowOfValidBytes.push(byte);
    }

    if (windowOfValidBytes.length === 8) {
      result += removeParityAndCombine(windowOfValidBytes);
      windowOfValidBytes = [];
    }
  }

  return result;
};
